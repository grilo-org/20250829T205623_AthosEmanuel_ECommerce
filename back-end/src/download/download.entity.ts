import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

/**
 * Entidade que representa os registros de download de produtos digitais por usuários.
 *
 * Cada combinação de usuário e produto é única (um usuário não pode ter mais de um registro para o mesmo produto).
 *
 * - `count`: número de downloads realizados.
 * - `maxAllowed`: número máximo de downloads permitidos.
 * - `user` e `product` têm carregamento automático (eager) e são deletados em cascata.
 * - Timestamps automáticos de criação e atualização.
 */

@Entity()
@Unique(['user', 'product'])
export class Download {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  product: Product;

  @Column({ default: 0 })
  count: number;

  @Column({ default: 3 })
  maxAllowed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
