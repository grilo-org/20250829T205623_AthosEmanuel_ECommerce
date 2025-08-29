import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

/**
 * Guard responsável por verificar se o usuário autenticado possui a role necessária
 * para acessar a rota. Utiliza metadados definidos pelo decorator @Roles().
 *
 * Se nenhuma role for exigida, o acesso é permitido.
 * Caso o usuário não tenha a role necessária, lança um ForbiddenException.
 */

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado: função insuficiente');
    }
    return true;
  }
}
