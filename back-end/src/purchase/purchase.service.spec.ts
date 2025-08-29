import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
import { Purchase } from './purchase.entity';
import { PurchaseService } from './purchase.service';

// `mockUser`: representa um usuário fictício com dados básicos.
const mockUser: User = {
  userId: 1,
  name: 'User Teste',
  email: 'user@test.com',
  password: 'hashed',
  role: 'user',
  purchases: [],
};

//`mockProduct`: representa um produto digital fictício, incluindo um arquivo em buffer.
const mockProduct: Product = {
  id: 101,
  title: 'Produto Teste',
  description: 'Um produto digital',
  price: 100,
  file: Buffer.from('conteudo'),
  purchases: [],
};

//`mockPurchase`: representa uma compra fictícia associando o usuário e o produto mocks.
const mockPurchase: Purchase = {
  id: 1,
  user: mockUser,
  product: mockProduct,
  createdAt: new Date(),
};

describe('PurchaseService', () => {
  let service: PurchaseService;
  let purchaseRepository: jest.Mocked<Repository<Purchase>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let productRepository: jest.Mocked<Repository<Product>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
    purchaseRepository = module.get(getRepositoryToken(Purchase));
    userRepository = module.get(getRepositoryToken(User));
    productRepository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPurchase', () => {
    it('should create a purchase successfully', async () => {
      purchaseRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(mockUser);
      productRepository.findOne.mockResolvedValue(mockProduct);
      purchaseRepository.create.mockReturnValue(mockPurchase);
      purchaseRepository.save.mockResolvedValue(mockPurchase);

      const result = await service.createPurchase(
        mockUser.userId,
        mockProduct.id,
      );

      expect(purchaseRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: mockUser.userId },
          product: { id: mockProduct.id },
        },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
      });
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(purchaseRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        product: mockProduct,
      });
      expect(purchaseRepository.save).toHaveBeenCalledWith(mockPurchase);

      const { user, ...expected } = mockPurchase;
      expect(result).toEqual(expected);
    });

    it('should throw error if purchase already exists', async () => {
      purchaseRepository.findOne.mockResolvedValue(mockPurchase);

      await expect(
        service.createPurchase(mockUser.userId, mockProduct.id),
      ).rejects.toThrow('Produto já comprado por este usuário');

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(productRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      purchaseRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.createPurchase(999, mockProduct.id)).rejects.toThrow(
        'Usuário não encontrado',
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 999 },
      });
    });

    it('should throw error if product not found', async () => {
      purchaseRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(mockUser);
      productRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPurchase(mockUser.userId, 999),
      ).rejects.toThrow('Produto não encontrado');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
      });
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('getUserPurchases', () => {
    it('should return purchases for a user', async () => {
      const userId = mockUser.userId;
      purchaseRepository.find.mockResolvedValue([mockPurchase]);

      const result = await service.getUserPurchases(userId);

      expect(purchaseRepository.find).toHaveBeenCalledWith({
        where: { user: { userId: userId } },
        relations: ['product'],
      });
      expect(result).toEqual([mockPurchase]);
    });

    it('should return empty array if user has no purchases', async () => {
      purchaseRepository.find.mockResolvedValue([]);

      const result = await service.getUserPurchases(mockUser.userId);

      expect(result).toEqual([]);
    });
  });
});
