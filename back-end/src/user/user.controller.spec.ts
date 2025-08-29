import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

// Mock dos Guardiões
// Em testes de unidade de controllers, geralmente mockamos os guards para que eles permitam o acesso
// Isso nos permite testar a lógica do controller sem depender da complexidade dos guards.
const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

const mockRolesGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  // Mock do UserService
  const mockUserService = {
    findAll: jest.fn(),
    remove: jest.fn(),
    findMe: jest.fn(),
    updateMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        // Mocks para os Guardiões
        // Fornecemos os mocks para que o NestJS use em vez das implementações reais
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: RolesGuard,
          useValue: mockRolesGuard,
        },
        // Reflector é usado internamente pelo RolesGuard. Mesmo com o mock do guard,
        // pode ser necessário prover um mock simples se o NestJS tentar injetá-lo.
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard) // Informa ao Nest que vamos substituir JwtAuthGuard
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard) // Informa ao Nest que vamos substituir RolesGuard
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa todos os mocks após cada teste
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'User 1', email: 'u1@ex.com', role: 'user' },
        { id: 2, name: 'Admin 1', email: 'a1@ex.com', role: 'admin' },
      ];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('remove', () => {
    it('should remove a user by ID', async () => {
      const userId = '1';
      const removedUser = {
        id: 1,
        name: 'Removed User',
        email: 'removed@ex.com',
      };
      mockUserService.remove.mockResolvedValue(removedUser);

      const result = await controller.remove(userId);

      expect(userService.remove).toHaveBeenCalledWith(Number(userId));
      expect(result).toEqual(removedUser);
    });

    it('should throw BadRequestException if user cannot be removed due to associated purchases', async () => {
      const userId = '1';
      const errorMessage =
        'Usuário não pode ser excluído porque possui compras associadas.';
      mockUserService.remove.mockRejectedValue(new Error(errorMessage));

      await expect(controller.remove(userId)).rejects.toThrow(
        new BadRequestException(errorMessage),
      );
      expect(userService.remove).toHaveBeenCalledWith(Number(userId));
    });

    it('should rethrow other errors from userService.remove', async () => {
      const userId = '1';
      const genericError = new Error('Database error');
      mockUserService.remove.mockRejectedValue(genericError);

      await expect(controller.remove(userId)).rejects.toThrow(genericError);
      expect(userService.remove).toHaveBeenCalledWith(Number(userId));
    });

    it('should throw BadRequestException if user is not authenticated', async () => {
      const updateDto = { name: 'New Name' };
      const mockRequest = { user: null };

      await expect(controller.updateMe(mockRequest, updateDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(userService.updateMe).not.toHaveBeenCalled();
    });
  });

  describe('findMe', () => {
    it('should return the currently authenticated user', async () => {
      const userId = 1;
      const user = {
        userId: userId,
        name: 'Current User',
        email: 'me@example.com',
      };

      // Mock do service retornando o usuário simulado
      mockUserService.findMe.mockResolvedValue(user);

      // Simula o request com user.userId
      const mockRequest = { user: { userId: userId } };

      // Chamada ao controller (essa linha ativa a linha 52 do user.controller.ts)
      const result = await controller.findMe(mockRequest);

      // Verificações
      expect(userService.findMe).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });
  });

  describe('updateMe', () => {
    it('should update the currently authenticated user data', async () => {
      const userId = 1;
      const updateDto = { name: 'Updated Name', email: 'updated@example.com' };
      const updatedUser = {
        userId: userId,
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      mockUserService.updateMe.mockResolvedValue(updatedUser);

      // Simula o objeto de requisição com o usuário autenticado
      const mockRequest = { user: { userId: userId } };
      const result = await controller.updateMe(mockRequest, updateDto);

      expect(userService.updateMe).toHaveBeenCalledWith(userId, updateDto);
      expect(result).toEqual(updatedUser);
    });
  });
});
