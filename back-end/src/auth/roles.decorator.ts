import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para definir quais roles têm acesso a uma rota.
 */

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
