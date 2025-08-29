// src/auth/jwt.strategy.spec.ts (Exemplo, o seu arquivo deve ser similar)

import { JwtStrategy } from './jwt.strategy'; // Assumindo que este é o caminho correto

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(() => {
    jwtStrategy = new JwtStrategy();
  });

  it('should return a user object if payload is valid', async () => {
    const payload = { sub: 123, email: 'test@example.com', role: 'user' };
    const user = await jwtStrategy.validate(payload);

    expect(user).toEqual({
      userId: payload.sub,

      email: payload.email,
      role: payload.role,
    });
  });

  it('should return a user object with undefined properties if payload is incomplete', async () => {
    const incompletePayload = { sub: 456, email: 'incomplete@example.com' };
    const user = await jwtStrategy.validate(incompletePayload);

    expect(user).toEqual({
      userId: incompletePayload.sub,
      email: incompletePayload.email,
      role: undefined,
    });
  });
});
