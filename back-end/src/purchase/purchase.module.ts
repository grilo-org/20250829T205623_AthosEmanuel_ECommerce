import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
import { PurchaseController } from './purchase.controller';
import { Purchase } from './purchase.entity';
import { PurchaseService } from './purchase.service';

/**
 * Módulo responsável pelo gerenciamento das compras de produtos digitais.
 *
 * Importa as entidades Purchase, User e Product para uso pelo TypeORM.
 * Define o controlador e serviço relacionados às operações de compra.
 * Expõe o PurchaseService para ser utilizado em outros módulos da aplicação.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Purchase, User, Product])],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
