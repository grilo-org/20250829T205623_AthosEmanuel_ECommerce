import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Download } from '../download/download.entity';
import { Purchase } from '../purchase/purchase.entity';
import { User } from '../user/user.entity';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { ProductService } from './product.service';

/**
 * Módulo responsável por gerenciar produtos digitais.
 *
 * Importa as entidades relacionadas (Product, Purchase, User, Download)
 * para uso pelo TypeORM.
 *
 * Expõe o serviço de produto (`ProductService`) e o controlador (`ProductController`)
 * para operações relacionadas a produtos.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Product, Purchase, User, Download])],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
