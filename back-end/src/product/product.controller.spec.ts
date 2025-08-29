import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

// Mock dos Guardiões
const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = { userId: 1, role: 'admin', email: 'test@example.com' };
    return true;
  }),
};

const mockRolesGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    return true;
  }),
};

// Mock do ProductService
const mockProductService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  getFileIfPurchased: jest.fn(),
  findPurchasedByUser: jest.fn(),
  remove: jest.fn(),
};

// Define um mock para o FileInterceptor.
// Para testes unitários diretos no controller, o `@UploadedFile()` recebe o argumento que passamos.
// O MockFileInterceptor abaixo é mais relevante para testar a integração do interceptor
// com a pilha de requisições, mas no método do controller que chamamos diretamente,
// somos nós que passamos o valor do 'file'.
class MockFileInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle();
  }
}

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .overrideInterceptor(FileInterceptor('file'))
      .useClass(MockFileInterceptor) // Usamos o MockFileInterceptor para satisfazer a injeção de dependência.
      .compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); // Restaura mocks para garantir que espiões temporários não afetem outros testes.
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with a file', async () => {
      const createProductDto: CreateProductDto = {
        title: 'New Product Title',
        description: 'Description of the new product',
        price: 100.5,
      };
      // O dummyFile precisa ter a propriedade 'buffer' para o teste funcionar corretamente.
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('mock pdf content'), // Conteúdo de exemplo
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 123,
      } as Express.Multer.File;

      mockProductService.create.mockResolvedValue({
        id: 1,
        ...createProductDto,
      });

      const result = await controller.create(createProductDto, mockFile);

      expect(productService.create).toHaveBeenCalledWith(
        createProductDto,
        mockFile.buffer, // Agora esperamos o buffer do mockFile
      );
      expect(result).toEqual({ id: 1, ...createProductDto });
    });

    it('should throw BadRequestException if no file is provided', async () => {
      const createProductDto: CreateProductDto = {
        title: 'Product without file title',
        description: 'Desc',
        price: 50,
      };
      await expect(
        controller.create(
          createProductDto,
          undefined as unknown as Express.Multer.File,
        ),
      ).rejects.toThrow(new BadRequestException('Arquivo PDF é obrigatório'));

      expect(productService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all products and pass userId if authenticated', async () => {
      const products = [{ id: 1, title: 'Prod1', isPurchased: true }];
      const mockRequest = { user: { userId: 10 } };

      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(mockRequest);

      expect(productService.findAll).toHaveBeenCalledWith(10);
      expect(result).toEqual(products);
    });

    it('should return all products and pass undefined userId if not authenticated', async () => {
      const products = [{ id: 2, title: 'Prod2', isPurchased: false }];
      const mockRequest = { user: undefined };

      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(mockRequest);

      expect(productService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a single product by ID', async () => {
      const product = { id: 1, title: 'Specific Product' };
      mockProductService.findOne.mockResolvedValue(product);

      const result = await controller.findOne(1);

      expect(productService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update a product without a new file', async () => {
      const updateProductDto: CreateProductDto = {
        title: 'Updated Name',
        description: 'Updated Desc',
        price: 200,
      };
      const updatedProduct = { id: 1, ...updateProductDto };

      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(1, updateProductDto, undefined);

      expect(productService.update).toHaveBeenCalledWith(
        1,
        updateProductDto,
        undefined,
      );
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('getFile', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        set: jest.fn().mockReturnThis(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it('should return the file buffer and set headers if purchased', async () => {
      const fileBuffer = Buffer.from('Mock PDF Content');
      const mockRequest = { user: { userId: 1 } };

      mockProductService.getFileIfPurchased.mockResolvedValue(fileBuffer);

      await controller.getFile(1, mockRequest, mockResponse as Response);

      expect(productService.getFileIfPurchased).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="produto_1.pdf"`,
      });
      expect(mockResponse.send).toHaveBeenCalledWith(fileBuffer);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 Forbidden if user is not authorized to download file', async () => {
      const errorMessage =
        'Acesso negado: produto não comprado ou sem permissão';
      mockProductService.getFileIfPurchased.mockRejectedValue(
        new ForbiddenException(errorMessage),
      );
      const mockRequest = { user: { userId: 1 } };

      await controller.getFile(1, mockRequest, mockResponse as Response);

      expect(productService.getFileIfPurchased).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should return 404 Not Found for other errors', async () => {
      mockProductService.getFileIfPurchased.mockRejectedValue(
        new Error('Some internal error'),
      );
      const mockRequest = { user: { userId: 1 } };

      await controller.getFile(1, mockRequest, mockResponse as Response);

      expect(productService.getFileIfPurchased).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Arquivo não encontrado',
      });
      expect(mockResponse.send).not.toHaveBeenCalled();
    });
  });

  describe('getPurchasedProducts', () => {
    it('should return purchased products for a given user ID', async () => {
      const purchasedProducts = [{ id: 1, title: 'Purchased Item' }];
      mockProductService.findPurchasedByUser.mockResolvedValue(
        purchasedProducts,
      );

      const result = await controller.getPurchasedProducts(123);

      expect(productService.findPurchasedByUser).toHaveBeenCalledWith(123);
      expect(result).toEqual(purchasedProducts);
    });
  });

  describe('remove', () => {
    it('should remove a product by ID', async () => {
      mockProductService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(1);

      expect(productService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ affected: 1 });
    });
  });
});
