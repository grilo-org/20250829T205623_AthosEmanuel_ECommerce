import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Download } from './download/download.entity';
import { ProductModule } from './product/product.module';
import { PurchaseModule } from './purchase/purchase.module';
import { UserModule } from './user/user.module';

/**
 * Módulo principal da aplicação.
 * Aqui configuramos o TypeORM para conectar ao banco SQLite,
 * definimos onde estão as entidades do projeto e ativamos a
 * sincronização automática do schema durante o desenvolvimento.
 */

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Apenas para desenvolvimento (gera as tabelas automaticamente)
    }),
    UserModule,
    AuthModule,
    ProductModule,
    PurchaseModule,
    Download,
  ],
})
export class AppModule {}
