import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rotas usando JWT via estratégia "jwt".
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
