import { BadRequestException, ExecutionContext } from '@nestjs/common';
// src/purchase/purchase.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

// Mock do JwtAuthGuard para sempre permitir o acesso em testes de unidade
const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    // Simula que o JwtAuthGuard anexa o usuário ao request.
    const request = context.switchToHttp().getRequest();
    request.user = { userId: 1, email: 'test@example.com' };
    return true;
  }),
};

// Mock do PurchaseService para controlar seus retornos
const mockPurchaseService = {
  createPurchase: jest.fn(),
  getUserPurchases: jest.fn(),
};

describe('PurchaseController', () => {
  let controller: PurchaseController;
  let purchaseService: PurchaseService;

  // Configura o módulo de teste antes de cada teste.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseController],
      providers: [
        {
          provide: PurchaseService,
          useValue: mockPurchaseService,
        },
      ],
    })
      // Sobrescreve o JwtAuthGuard.
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PurchaseController>(PurchaseController);
    purchaseService = module.get<PurchaseService>(PurchaseService);
  });

  // Limpa todos os mocks após cada teste.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Verifica se o controller está definido.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a purchase successfully', async () => {
      const userId = 1;
      const productId = 10;
      const mockRequest = { user: { userId } };
      const createdPurchase = { id: 1, userId, productId };

      mockPurchaseService.createPurchase.mockResolvedValue(createdPurchase);

      const result = await controller.create(mockRequest, productId);

      expect(purchaseService.createPurchase).toHaveBeenCalledWith(
        userId,
        productId,
      );
      expect(result).toEqual(createdPurchase);
    });

    it('should throw BadRequestException if purchase creation fails', async () => {
      const userId = 1;
      const productId = 10;
      const mockRequest = { user: { userId } };
      const errorMessage = 'Produto já comprado ou não disponível';

      mockPurchaseService.createPurchase.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.create(mockRequest, productId)).rejects.toThrow(
        new BadRequestException(errorMessage),
      );
      expect(purchaseService.createPurchase).toHaveBeenCalledWith(
        userId,
        productId,
      );
    });

    it('should throw BadRequestException with generic message for unknown errors', async () => {
      const userId = 1;
      const productId = 10;
      const mockRequest = { user: { userId } };

      mockPurchaseService.createPurchase.mockRejectedValue(new Error()); // Erro sem mensagem

      await expect(controller.create(mockRequest, productId)).rejects.toThrow(
        new BadRequestException('Erro ao realizar compra'),
      );
      expect(purchaseService.createPurchase).toHaveBeenCalledWith(
        userId,
        productId,
      );
    });
  });

  describe('getUserPurchases', () => {
    it('should return all purchases for a user', async () => {
      const userId = 1;
      const mockRequest = { user: { userId } };
      const userPurchases = [
        { id: 1, productId: 10 },
        { id: 2, productId: 20 },
      ];

      mockPurchaseService.getUserPurchases.mockResolvedValue(userPurchases);

      const result = await controller.getUserPurchases(mockRequest);

      expect(purchaseService.getUserPurchases).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userPurchases);
    });
  });
});
