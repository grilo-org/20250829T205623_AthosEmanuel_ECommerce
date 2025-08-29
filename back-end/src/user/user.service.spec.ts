import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
// Importe Purchase se você for mockar relações mais complexas, embora não seja estritamente necessário para este teste
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>; // Irá conter a instância mockada do Repository

  // Mock do TypeORM Repository
  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User), // Token para injetar o Repository de User
          useValue: mockUserRepository, // Usa nosso mock
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User)); // Obtém a instância mockada do repo
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks após cada teste
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123', // Adicionado
        role: 'user', // Adicionado
      } as Partial<User>; // Partial permite que não tenha todas as propriedades ainda

      const createdUser = {
        userId: 1,
        ...userData,
        purchases: [], // Certifique-se de incluir purchases, mesmo que vazio
      } as User; // Agora este objeto está completo para o tipo User

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(repo.create).toHaveBeenCalledWith(userData);
      expect(repo.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const foundUser = {
        userId: 1,
        name: 'Test User',
        email,
        password: 'hashedpassword',
        role: 'user',
        purchases: [],
      } as User;

      mockUserRepository.findOne.mockResolvedValue(foundUser);

      const result = await service.findByEmail(email);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(foundUser);
    });

    it('should return null if user not found by email', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users with role "user" and selected fields', async () => {
      const users = [
        {
          userId: 1,
          name: 'User 1',
          email: 'user1@example.com',
          password: 'pw1',
          role: 'user',
          purchases: [],
        },
        {
          userId: 2,
          name: 'User 2',
          email: 'user2@example.com',
          password: 'pw2',
          role: 'user',
          purchases: [],
        },
      ] as User[];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        where: { role: 'user' },
        select: ['userId', 'name', 'email', 'role'],
      });
      expect(result).toEqual(users);
    });
  });

  describe('remove', () => {
    it('should remove a user without purchases', async () => {
      const userId = 1;
      const userToRemove = {
        userId: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'someHashedPassword', // Adicionado
        role: 'user', // Adicionado
        purchases: [],
      } as User;

      mockUserRepository.findOne.mockResolvedValue(userToRemove);
      mockUserRepository.remove.mockResolvedValue(userToRemove);

      const result = await service.remove(userId);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { userId: userId },
        relations: ['purchases'],
      });
      expect(repo.remove).toHaveBeenCalledWith(userToRemove);
      expect(result).toEqual(userToRemove);
    });

    it('should throw an error if user not found', async () => {
      const userId = 999;

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(
        `Usuário com ID ${userId} não encontrado`,
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { userId: userId },
        relations: ['purchases'],
      });
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('should throw an error if user has associated purchases', async () => {
      const userId = 1;
      const userWithPurchases = {
        userId: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'someHashedPassword', // Adicionado
        role: 'user', // Adicionado
        purchases: [{ id: 101, amount: 50 } as any], // Simular uma compra
      } as User;

      mockUserRepository.findOne.mockResolvedValue(userWithPurchases);

      await expect(service.remove(userId)).rejects.toThrow(
        `Usuário não pode ser excluído porque possui compras associadas.`,
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { userId: userId },
        relations: ['purchases'],
      });
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });

  describe('findMe', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const foundUser = {
        userId: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'someHashedPassword',
        role: 'user',
        purchases: [],
      } as User;

      mockUserRepository.findOne.mockResolvedValue(foundUser);

      const result = await service.findMe(userId);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: userId } });
      expect(result).toEqual(foundUser);
    });

    it('should return null if user not found by ID', async () => {
      const userId = 999;

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findMe(userId);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: userId } });
      expect(result).toBeNull();
    });
  });

  describe('updateMe', () => {
    // ...
    it('should call findMe even if update does not affect records (e.g., no change)', async () => {
      const userId = 1;
      const updateData = { name: 'Same Name' };
      const existingUser = {
        userId: userId,
        name: 'Same Name',
        email: 'test@example.com',
        password: 'someHashedPassword',
        role: 'user',
        purchases: [],
      } as User;

      mockUserRepository.update.mockResolvedValue({ affected: 0 });
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.updateMe(userId, updateData);

      // Linha de correção:
      expect(repo.update).toHaveBeenCalledWith({ userId: userId }, updateData); // <-- Mudei userId para { id: userId }
      // ...
    });

    it('should throw an error if userId is not provided', async () => {
      const updateData = { name: 'New Name' };

      // Testando userId como undefined
      await expect(
        service.updateMe(undefined as any, updateData),
      ).rejects.toThrow('userId é obrigatório');

      // Opcional: também pode testar null e 0 se quiser mais robustez
      await expect(service.updateMe(null as any, updateData)).rejects.toThrow(
        'userId é obrigatório',
      );

      await expect(service.updateMe(0, updateData)).rejects.toThrow(
        'userId é obrigatório',
      );
    });
  });
});
