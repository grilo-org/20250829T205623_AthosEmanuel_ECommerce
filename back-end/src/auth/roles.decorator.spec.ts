import { SetMetadata } from '@nestjs/common';
import { Roles } from './roles.decorator';

// Mock do SetMetadata para verificar sua chamada.
jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  // Limpa os mocks após cada teste.
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Roles).toBeDefined();
  });

  it('should call SetMetadata with "roles" key and provided roles', () => {
    const testRoles = ['admin', 'moderator'];

    @Roles(...testRoles)
    class TestClass {}

    expect(SetMetadata).toHaveBeenCalledTimes(1);
    expect(SetMetadata).toHaveBeenCalledWith('roles', testRoles);
  });

  it('should call SetMetadata with "roles" key and empty array if no roles are provided', () => {
    const testRoles: string[] = [];

    @Roles(...testRoles)
    class AnotherTestClass {}

    expect(SetMetadata).toHaveBeenCalledTimes(1);
    expect(SetMetadata).toHaveBeenCalledWith('roles', testRoles);
  });
});
