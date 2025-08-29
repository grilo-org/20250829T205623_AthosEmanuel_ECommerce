import * as bcrypt from 'bcryptjs'; // Importa o bcrypt mockado

import { Test, TestingModule } from '@nestjs/testing';

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/user.entity'; // Importe a entidade User
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

// Mock da biblioteca bcryptjs
// Isso garante que o bcrypt real não seja usado durante os testes
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password, salt) => `hashed_${password}_${salt}`), // Simula o hash
  compare: jest.fn(
    (password, hashedPassword) =>
      password === hashedPassword.replace('hashed_', '').replace('_10', ''),
  ), // Simula a comparação
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Mock do UserService
  const mockUserService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  // Mock do JwtService
  const mockJwtService = {
    sign: jest.fn(() => 'mocked_jwt_token'), // Simula a assinatura de um token
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa todos os mocks após cada teste
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash the password and create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'plainPassword',
      };
      const hashedPassword = 'hashed_plainPassword_10';
      const createdUser = {
        userId: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: 'user',
        purchases: [], // Conforme sua entidade User
      } as User;

      // Configura os mocks
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserService.create.mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);

      // Verifica se bcrypt.hash foi chamado corretamente
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      // Verifica se userService.create foi chamado com os dados corretos (senha hashed)
      expect(userService.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: 'user',
      });
      // Verifica o resultado retornado
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'plainPassword',
      };
      const errorMessage = 'Email already exists';

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword'); // Mock do hash
      mockUserService.create.mockRejectedValue(new Error(errorMessage)); // Simula falha na criação

      await expect(service.register(createUserDto)).rejects.toThrow(
        errorMessage,
      );
      expect(bcrypt.hash).toHaveBeenCalled(); // Garante que o hash foi tentado
      expect(userService.create).toHaveBeenCalled(); // Garante que a criação foi tentada
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'correctPassword';
    const hashedPassword = 'hashed_correctPassword_10';
    const user = {
      userId: 1,
      name: 'Test User',
      email,
      password: hashedPassword,
      role: 'user',
      purchases: [],
    } as User;

    it('should return the user if credentials are valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Senha válida

      const result = await service.validateUser(email, password);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null); // Usuário não encontrado

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException('Usuário não encontrado'),
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled(); // Não deve tentar comparar a senha
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Senha inválida

      await expect(
        service.validateUser(email, 'wrongPassword'),
      ).rejects.toThrow(new UnauthorizedException('Senha inválida'));
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        hashedPassword,
      );
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'correctPassword';
    const user = {
      userId: 1,
      name: 'Test User',
      email,
      password: 'hashed_correctPassword_10',
      role: 'user',
      purchases: [],
    } as User;
    const expectedPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };
    const expectedAccessToken = 'mocked_jwt_token';

    // Mock do validateUser para simplificar o teste de login
    let validateUserSpy: jest.SpyInstance;

    beforeEach(() => {
      // Espiona e mocka o método validateUser do próprio serviço
      validateUserSpy = jest.spyOn(service, 'validateUser');
    });

    it('should return an access token and user info on successful login', async () => {
      validateUserSpy.mockResolvedValue(user); // validateUser retorna o usuário
      mockJwtService.sign.mockReturnValue(expectedAccessToken); // JwtService.sign retorna o token

      const result = await service.login(email, password);

      expect(validateUserSpy).toHaveBeenCalledWith(email, password);
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual({
        access_token: expectedAccessToken,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    });

    it('should throw an error if validateUser fails', async () => {
      const errorMessage = 'Invalid credentials';
      validateUserSpy.mockRejectedValue(
        new UnauthorizedException(errorMessage),
      ); // validateUser falha

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException(errorMessage),
      );
      expect(validateUserSpy).toHaveBeenCalledWith(email, password);
      expect(jwtService.sign).not.toHaveBeenCalled(); // sign não deve ser chamado
    });
  });
});
