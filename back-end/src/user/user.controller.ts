import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from './user.entity';
import { UserService } from './user.service';

/**
 * Controller responsável pela gestão dos usuários.
 *
 * Todas as rotas estão protegidas por autenticação JWT e autorização via RolesGuard.
 * Apenas usuários com papel 'admin' podem acessar rotas administrativas.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Rota para listar todos os usuários.
   * Somente acessível por administradores.
   * @returns Lista completa de usuários.
   */
  @Roles('admin')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * Rota para excluir um usuário pelo ID.
   * Somente acessível por administradores.
   * Lança BadRequestException se o usuário não puder ser excluído por regras de negócio.
   * @param id ID do usuário a ser removido.
   * @returns Mensagem de confirmação da exclusão.
   */
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.userService.remove(Number(id));
    } catch (error) {
      if (error.message.includes('não pode ser excluído')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * Rota para o usuário autenticado acessar seus próprios dados.
   * Não requer papel especial, apenas autenticação.
   * @param req Objeto da requisição contendo o usuário autenticado.
   * @returns Dados do usuário logado.
   */
  @Get('me')
  async findMe(@Request() req) {
    return this.userService.findMe(req.user.userId);
  }

  /**
   * Rota para o usuário autenticado atualizar seus próprios dados.
   * Valida a existência do usuário no token antes de permitir atualização.
   * @param req Objeto da requisição contendo o usuário autenticado.
   * @param data Dados parciais para atualização.
   * @throws BadRequestException se usuário não autenticado.
   * @returns Dados atualizados do usuário.
   */
  @Put('me')
  async updateMe(@Request() req, @Body() data: Partial<User>) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Usuário não autenticado');
    }

    return this.userService.updateMe(userId, data);
  }
}
