import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

/**
 * Módulo responsável pela funcionalidade relacionada a usuários.
 *
 * Importa a entidade User para ser gerenciada pelo TypeORM.
 * Declara o controlador e serviço que manipulam as operações de usuário.
 * Exporta o UserService para uso em outros módulos da aplicação.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
