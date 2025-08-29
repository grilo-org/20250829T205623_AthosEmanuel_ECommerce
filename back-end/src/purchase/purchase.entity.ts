import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

/**
 * Entidade que representa uma compra realizada por um usuário.
 * Relaciona o usuário e o produto comprado.
 * Cada compra pode ter um link de download associado.
 * Um usuário não pode comprar o mesmo produto mais de uma vez.
 */
@Entity()
@Unique(['user', 'product'])
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.purchases, { eager: true })
  user: User;

  @ManyToOne(() => Product, (product) => product.purchases, { eager: true })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
