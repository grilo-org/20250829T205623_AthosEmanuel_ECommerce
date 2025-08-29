import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from './jwt-auth.guard';

// MOCK DO @nestjs/passport AuthGuard
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn((strategyName: string) => {
    return class MockAuthGuard {
      // O método canActivate DEVE retornar uma Promise<boolean> ou Promise<any>
      // que pode ser rejeitada.
      async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
          const user = mockAuthGuardBase.handleRequest(
            null, // err (do Passport)
            null, // user (do Passport)
            null, // info (do Passport)
            context, // context (do NestJS)
            null, // status (do Passport)
          );

          // Se handleRequest retorna um usuário, anexe-o e retorne true
          if (user) {
            request.user = user;
            return true;
          }
          // Se handleRequest retorna falsy (null/undefined) sem jogar erro,
          // o AuthGuard real lança UnauthorizedException por padrão.
          // Replicamos isso aqui.
          throw new UnauthorizedException();
        } catch (err) {
          // Se handleRequest joga um erro (como UnauthorizedException),
          // o AuthGuard real o re-lança.
          throw err;
        }
      }

      handleRequest = jest.fn(); // Este é o mock que controlamos nos testes
    };
  }),
}));

const mockAuthGuardBase = {
  handleRequest: jest.fn(),
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockRequest: any;

  // Mock de ExecutionContext
  const getMockExecutionContext = (user?: any): ExecutionContext => {
    mockRequest = { user: user };
    return {
      switchToHttp: () => ({
        getRequest: jest.fn(() => mockRequest),
        getResponse: jest.fn(() => ({})),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    // Conecta o handleRequest da instância do guard com o nosso mock controlável
    // @ts-ignore
    guard.handleRequest = mockAuthGuardBase.handleRequest;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should call handleRequest and return true if user is authenticated', async () => {
      const user = { userId: 1, email: 'test@example.com' };
      const context = getMockExecutionContext();

      mockAuthGuardBase.handleRequest.mockReturnValue(user);

      const result = await guard.canActivate(context);

      expect(mockAuthGuardBase.handleRequest).toHaveBeenCalledWith(
        null,
        null,
        null,
        context,
        null,
      );
      expect(mockRequest.user).toEqual(user);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if handleRequest returns falsy (no user)', async () => {
      const context = getMockExecutionContext();

      mockAuthGuardBase.handleRequest.mockReturnValue(null); // handleRequest retorna null

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthGuardBase.handleRequest).toHaveBeenCalledWith(
        null,
        null,
        null,
        context,
        null,
      );
      expect(mockRequest.user).toBeUndefined();
    });

    it('should rethrow UnauthorizedException if handleRequest throws an error', async () => {
      const errorMessage = 'Invalid token details';
      const context = getMockExecutionContext();

      mockAuthGuardBase.handleRequest.mockImplementation(() => {
        throw new UnauthorizedException(errorMessage);
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException(errorMessage),
      );
      expect(mockAuthGuardBase.handleRequest).toHaveBeenCalledWith(
        null,
        null,
        null,
        context,
        null,
      );
      expect(mockRequest.user).toBeUndefined();
    });
  });
});
