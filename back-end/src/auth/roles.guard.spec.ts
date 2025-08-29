import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  // Mock do Reflector para controlar os metadados.
  const mockReflector = {
    get: jest.fn(),
  };

  // Cria um mock de ExecutionContext.
  const createMockContext = (
    user?: any,
    handlerRoles?: string[],
  ): ExecutionContext => {
    mockReflector.get.mockReturnValue(handlerRoles);

    return {
      switchToHttp: () => ({
        getRequest: jest.fn(() => ({ user })), // Simula o objeto de requisição com o usuário
      }),
      getHandler: jest.fn(() => ({})), // Simula o handler da rota
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as any;
  };

  // Configura o módulo de teste antes de cada teste.
  beforeEach(() => {
    reflector = mockReflector as any;
    rolesGuard = new RolesGuard(reflector);
  });

  // Limpa os mocks após cada teste.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Verifica se o guardião está definido.
  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      const context = createMockContext({ role: 'user' }, undefined);
      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', context.getHandler());
    });

    it('should throw ForbiddenException if roles are required but no user is found', () => {
      const context = createMockContext(undefined, ['admin']);
      expect(() => rolesGuard.canActivate(context)).toThrow(
        new ForbiddenException('Acesso negado: função insuficiente'),
      );
      expect(reflector.get).toHaveBeenCalledWith('roles', context.getHandler());
    });

    it('should throw ForbiddenException if user role is not among required roles', () => {
      const user = { role: 'user' };
      const context = createMockContext(user, ['admin', 'moderator']);

      expect(() => rolesGuard.canActivate(context)).toThrow(
        new ForbiddenException('Acesso negado: função insuficiente'),
      );
      expect(reflector.get).toHaveBeenCalledWith('roles', context.getHandler());
    });

    it('should return true if user role is among required roles', () => {
      const user = { role: 'admin' };
      const context = createMockContext(user, ['admin', 'moderator']); // User é 'admin', que é exigido

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', context.getHandler());
    });
  });
});
