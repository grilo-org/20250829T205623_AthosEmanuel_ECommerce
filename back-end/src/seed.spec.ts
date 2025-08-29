import * as bcrypt from 'bcryptjs';

import { AppDataSource, seed } from './seed';

import { User } from './user/user.entity';

// Mocks das dependências
const mockUserRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

// Mock do bcryptjs para hashing
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string, saltOrRounds: number) =>
    Promise.resolve(`hashed_${password}_${saltOrRounds}`),
  ),
}));

describe('seed', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    jest
      .spyOn(AppDataSource, 'initialize')
      .mockResolvedValue(AppDataSource as any);
    jest.spyOn(AppDataSource, 'destroy').mockResolvedValue(undefined);
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockReturnValue(mockUserRepository as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should create an admin user if one does not exist', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);
    const expectedHashedPassword = 'hashed_0+E9s=0.0dHg_10';
    (bcrypt.hash as jest.Mock).mockResolvedValue(expectedHashedPassword);

    const createdAdminUser = {
      name: 'Admin',
      email: 'admin@example.com',
      password: expectedHashedPassword,
      role: 'admin',
    };
    mockUserRepository.create.mockReturnValue(createdAdminUser);
    mockUserRepository.save.mockResolvedValue(createdAdminUser);

    await seed();

    expect(AppDataSource.initialize).toHaveBeenCalledTimes(1);
    expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: 'admin@example.com',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('0+E9s=0.0dHg', 10);
    expect(mockUserRepository.create).toHaveBeenCalledWith(createdAdminUser);
    expect(mockUserRepository.save).toHaveBeenCalledWith(createdAdminUser);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Usuário admin criado com sucesso!',
    );
    expect(AppDataSource.destroy).toHaveBeenCalledTimes(1);
  });

  it('should log a message if admin user already exists', async () => {
    const existingAdmin = {
      id: 1,
      name: 'Existing Admin',
      email: 'admin@example.com',
      password: 'hashed_existing_password',
      role: 'admin',
    };
    mockUserRepository.findOneBy.mockResolvedValue(existingAdmin);

    await seed();

    expect(AppDataSource.initialize).toHaveBeenCalledTimes(1);
    expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: 'admin@example.com',
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Admin já existe.');
    expect(AppDataSource.destroy).toHaveBeenCalledTimes(1);
  });
});
