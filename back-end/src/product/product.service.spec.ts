import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Download } from '../download/download.entity';
import { Purchase } from '../purchase/purchase.entity';
import { User } from '../user/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';
import { ProductService } from './product.service';

// Mock do ProductRepository.
const mockProductRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

// Mock do PurchaseRepository.
const mockPurchaseRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
};

// Mock do UserRepository.
const mockUserRepository = {
  findOne: jest.fn(),
};

// Mock do DownloadRepository.
const mockDownloadRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};

// Mock de uma instância de User para uso em testes.
const mockUser: User = {
  userId: 1,
  name: 'Test User',
  email: 'user@example.com',
  password: 'hashedpassword',
  role: 'user',
  purchases: [],
};

// Mock de uma instância de Admin User para uso em testes.
const mockAdminUser: User = {
  userId: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'hashedadminpassword',
  role: 'admin',
  purchases: [],
};

// Mock de uma instância de Product para uso em testes.
const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'A description',
  price: 10.0,
  file: Buffer.from('mock pdf content'),
  purchases: [],
};

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;
  let purchaseRepository: Repository<Purchase>;
  let userRepository: Repository<User>;
  let downloadRepository: Repository<Download>;

  // Configura o módulo de teste antes de cada teste.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockPurchaseRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Download),
          useValue: mockDownloadRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    purchaseRepository = module.get<Repository<Purchase>>(
      getRepositoryToken(Purchase),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    downloadRepository = module.get<Repository<Download>>(
      getRepositoryToken(Download),
    );
  });

  // Limpa todos os mocks após cada teste.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Verifica se o serviço está definido.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        title: 'New Book',
        description: 'A new digital book',
        price: 25.0,
      };
      const fileBuffer = Buffer.from('pdf content');
      const createdProduct = { id: 1, ...createProductDto, file: fileBuffer };

      mockProductRepository.create.mockReturnValue(createdProduct);
      mockProductRepository.save.mockResolvedValue(createdProduct);

      const result = await service.create(createProductDto, fileBuffer);

      expect(productRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        file: fileBuffer,
      });
      expect(productRepository.save).toHaveBeenCalledWith(createdProduct);
      expect(result).toEqual({ message: 'Produto criado com sucesso!' });
    });

    it('should throw BadRequestException if fileBuffer is missing', async () => {
      const createProductDto: CreateProductDto = {
        title: 'Book without file',
        description: 'Missing file',
        price: 10.0,
      };

      await expect(
        service.create(createProductDto, undefined as any),
      ).rejects.toThrow(new BadRequestException('Arquivo PDF é obrigatório.'));

      expect(productRepository.create).not.toHaveBeenCalled();
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all products without file and without purchased status if no userId', async () => {
      const products = [
        { ...mockProduct, file: Buffer.from('file1') },
        {
          ...mockProduct,
          id: 2,
          title: 'Product 2',
          file: Buffer.from('file2'),
        },
      ];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll(undefined);

      expect(productRepository.find).toHaveBeenCalled();
      expect(result).toEqual([
        { ...mockProduct, file: undefined }, // file deve ser removido
        { ...mockProduct, id: 2, title: 'Product 2', file: undefined },
      ]);
      expect(result[0]).not.toHaveProperty('file');
      expect(result[0]).not.toHaveProperty('purchased');
    });

    // Testa a busca de todos os produtos com um userId, marcando os comprados.
    it('should return all products with purchased status if userId is provided', async () => {
      const products = [
        { ...mockProduct, file: Buffer.from('file1') },
        {
          ...mockProduct,
          id: 2,
          title: 'Product 2',
          file: Buffer.from('file2'),
        },
      ];
      const purchases = [
        {
          id: 1,
          user: mockUser,
          product: { ...mockProduct, file: undefined },
        },
      ];

      mockProductRepository.find.mockResolvedValue(products);
      mockPurchaseRepository.find.mockResolvedValue(purchases);

      const result = await service.findAll(mockUser.userId);

      expect(productRepository.find).toHaveBeenCalled();
      expect(purchaseRepository.find).toHaveBeenCalledWith({
        where: { user: { userId: mockUser.userId } },
        relations: ['product'],
      });
      expect(result).toEqual([
        { ...mockProduct, file: undefined, purchased: true },
        {
          ...mockProduct,
          id: 2,
          title: 'Product 2',
          file: undefined,
          purchased: false,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Produto não encontrado'),
      );
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a product without a new file', async () => {
      const updateDto: CreateProductDto = {
        title: 'Updated Title',
        description: 'Updated Desc',
        price: 15.0,
      };
      const updatedProduct = { ...mockProduct, ...updateDto };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPurchaseRepository.findOne.mockResolvedValue(null);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(mockProduct.id, updateDto, undefined);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(purchaseRepository.findOne).toHaveBeenCalledWith({
        where: { product: { id: mockProduct.id } },
      });
      expect(productRepository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual({ message: 'Produto editado com sucesso!' });
    });

    it('should update a product with a new file', async () => {
      const updateDto: CreateProductDto = {
        title: 'Updated Title with File',
        description: 'Updated Desc with File',
        price: 20.0,
      };
      const newFileBuffer = Buffer.from('new pdf content');
      const updatedProduct = {
        ...mockProduct,
        ...updateDto,
        file: newFileBuffer,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPurchaseRepository.findOne.mockResolvedValue(null);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(
        mockProduct.id,
        updateDto,
        newFileBuffer,
      );

      expect(productRepository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual({ message: 'Produto editado com sucesso!' });
    });

    it('should throw BadRequestException if product has already been purchased', async () => {
      const updateDto: CreateProductDto = {
        title: 'Updated Title',
        description: 'Updated Desc',
        price: 15.0,
      };
      const existingPurchase = { id: 1, product: mockProduct, user: mockUser };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPurchaseRepository.findOne.mockResolvedValue(existingPurchase);

      await expect(
        service.update(mockProduct.id, updateDto, undefined),
      ).rejects.toThrow(
        new BadRequestException(
          'Este produto já foi comprado e não pode ser editado.',
        ),
      );
      expect(productRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      const updateDto: CreateProductDto = {
        title: 'Non-existent Product',
        price: 0,
      };
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto, undefined)).rejects.toThrow(
        new NotFoundException('Produto não encontrado'),
      );
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      mockProductRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockProduct.id);

      expect(productRepository.delete).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toEqual({ message: 'Produto removido com sucesso.' });
    });

    it('should throw BadRequestException if product to remove is not found', async () => {
      mockProductRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(
        new BadRequestException('Erro ao remover produto.'),
      );
      expect(productRepository.delete).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException for foreign key constraint violation', async () => {
      const fkError = new Error('FOREIGN KEY constraint failed');
      (fkError as any).code = 'SQLITE_CONSTRAINT'; // Simula erro do SQLite
      mockProductRepository.delete.mockRejectedValue(fkError);

      await expect(service.remove(mockProduct.id)).rejects.toThrow(
        new BadRequestException(
          'Não é possível excluir o produto, pois ele já foi comprado por um ou mais usuários.',
        ),
      );
      expect(productRepository.delete).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      const genericError = new Error('Network error');
      mockProductRepository.delete.mockRejectedValue(genericError);

      await expect(service.remove(mockProduct.id)).rejects.toThrow(
        new InternalServerErrorException('Erro ao remover produto.'),
      );
      expect(productRepository.delete).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('getFileIfPurchased', () => {
    it('should throw ForbiddenException if userId is missing', async () => {
      await expect(
        service.getFileIfPurchased(mockProduct.id, undefined as any),
      ).rejects.toThrow(new ForbiddenException('Usuário não autenticado'));
    });

    it('should throw ForbiddenException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getFileIfPurchased(mockProduct.id, 999),
      ).rejects.toThrow(new ForbiddenException('Usuário não encontrado'));
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 999 },
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getFileIfPurchased(999, mockUser.userId),
      ).rejects.toThrow(new NotFoundException('Produto não encontrado'));
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should return product file for admin user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdminUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.getFileIfPurchased(
        mockProduct.id,
        mockAdminUser.userId,
      );

      expect(result).toEqual(mockProduct.file);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockAdminUser.userId },
      });
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(purchaseRepository.findOne).not.toHaveBeenCalled(); // Não verifica compra para admin
    });

    it('should throw ForbiddenException if user has not purchased the product', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPurchaseRepository.findOne.mockResolvedValue(null); // Usuário não comprou

      await expect(
        service.getFileIfPurchased(mockProduct.id, mockUser.userId),
      ).rejects.toThrow(
        new ForbiddenException('Você não comprou este produto'),
      );
      expect(purchaseRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: mockUser.userId },
          product: { id: mockProduct.id },
        },
      });
    });

    it('should return product file and increment download count if purchased (first download)', async () => {
      const purchase = { id: 1, user: mockUser, product: mockProduct };

      const downloadObjectCreatedByService = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        count: 0,
        maxAllowed: 3,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPurchaseRepository.findOne.mockResolvedValue(purchase);
      mockDownloadRepository.findOne.mockResolvedValue(null);
      mockDownloadRepository.create.mockReturnValue(
        downloadObjectCreatedByService,
      );

      mockDownloadRepository.save.mockResolvedValue(
        downloadObjectCreatedByService,
      );

      const result = await service.getFileIfPurchased(
        mockProduct.id,
        mockUser.userId,
      );

      expect(downloadRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: mockUser.userId },
          product: { id: mockProduct.id },
        },
      });
      expect(downloadRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        product: mockProduct,
        count: 0, // O serviço deve chamar create com 0
        maxAllowed: 3,
      });

      expect(downloadObjectCreatedByService.count).toBe(1);
      expect(downloadRepository.save).toHaveBeenCalledWith(
        downloadObjectCreatedByService,
      );
      expect(result).toEqual(mockProduct.file);
    });

    it('should return product file and increment download count if purchased (existing downloads)', async () => {
      const purchase = { id: 1, user: mockUser, product: mockProduct };
      const existingDownload = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        count: 1,
        maxAllowed: 3,
      };
      const updatedDownload = { ...existingDownload, count: 2 };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPurchaseRepository.findOne.mockResolvedValue(purchase);
      mockDownloadRepository.findOne.mockResolvedValue(existingDownload);
      mockDownloadRepository.save.mockResolvedValue(updatedDownload);

      const result = await service.getFileIfPurchased(
        mockProduct.id,
        mockUser.userId,
      );

      expect(downloadRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { userId: mockUser.userId },
          product: { id: mockProduct.id },
        },
      });
      expect(downloadRepository.create).not.toHaveBeenCalled();
      expect(existingDownload.count).toBe(2);
      expect(downloadRepository.save).toHaveBeenCalledWith(existingDownload);
      expect(result).toEqual(mockProduct.file);
    });

    it('should throw ForbiddenException if download limit is reached', async () => {
      const purchase = { id: 1, user: mockUser, product: mockProduct };
      const existingDownload = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        count: 3,
        maxAllowed: 3,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPurchaseRepository.findOne.mockResolvedValue(purchase);
      mockDownloadRepository.findOne.mockResolvedValue(existingDownload);

      await expect(
        service.getFileIfPurchased(mockProduct.id, mockUser.userId),
      ).rejects.toThrow(
        new ForbiddenException(
          'Você atingiu o limite de downloads para este produto',
        ),
      );
      expect(downloadRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findPurchasedByUser', () => {
    it('should return purchased products for a specific user', async () => {
      const purchasedProducts = [
        { ...mockProduct, file: undefined },
        { ...mockProduct, id: 2, title: 'Another Purchased', file: undefined },
      ];
      const purchases = [
        {
          id: 1,
          user: mockUser,
          product: { ...mockProduct, file: Buffer.from('file1') },
        },
        {
          id: 2,
          user: mockUser,
          product: {
            ...mockProduct,
            id: 2,
            title: 'Another Purchased',
            file: Buffer.from('file2'),
          },
        },
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPurchaseRepository.find.mockResolvedValue(purchases);

      const result = await service.findPurchasedByUser(mockUser.userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
      });
      expect(purchaseRepository.find).toHaveBeenCalledWith({
        where: { user: { userId: mockUser.userId } },
        relations: ['product'],
      });
      expect(result).toEqual(purchasedProducts);
      expect(result[0]).not.toHaveProperty('file');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findPurchasedByUser(999)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 999 },
      });
      expect(purchaseRepository.find).not.toHaveBeenCalled();
    });
  });
});
