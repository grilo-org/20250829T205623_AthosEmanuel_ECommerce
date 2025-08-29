import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock do AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService, // Provê o AuthService...
          useValue: mockAuthService, // ...usando nossa implementação mockada
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService); // Obtém a instância mockada
  });

  afterEach(() => {
    // Limpa os mocks após cada teste para garantir isolamento
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with the correct data and return the result', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { id: 1, ...createUserDto };

      // Configura o mock para retornar um valor específico quando chamado
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      // Verifica se o método register do serviço foi chamado com os dados corretos
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      // Verifica se o controller retornou o resultado esperado
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if authService.register throws an error', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const errorMessage = 'Email already exists';

      // Configura o mock para rejeitar a promessa com um erro
      mockAuthService.register.mockRejectedValue(new Error(errorMessage));

      await expect(controller.register(createUserDto)).rejects.toThrow(
        errorMessage,
      );
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with the correct credentials and return the result', async () => {
      const loginBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { access_token: 'some-jwt-token' };

      // Configura o mock para retornar um valor específico quando chamado
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginBody);

      // Verifica se o método login do serviço foi chamado com os dados corretos
      expect(authService.login).toHaveBeenCalledWith(
        loginBody.email,
        loginBody.password,
      );
      // Verifica se o controller retornou o resultado esperado
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if authService.login throws an error', async () => {
      const loginBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      const errorMessage = 'Invalid credentials';

      // Configura o mock para rejeitar a promessa com um erro
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      await expect(controller.login(loginBody)).rejects.toThrow(errorMessage);
      expect(authService.login).toHaveBeenCalledWith(
        loginBody.email,
        loginBody.password,
      );
    });
  });
});
