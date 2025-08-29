import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Purchase } from '../purchase/purchase.entity';

/**
 * Entidade que representa um usuário do sistema.
 *
 * Propriedades principais:
 * - `userId`: identificador único do usuário.
 * - `name`: nome completo do usuário.
 * - `email`: e-mail único usado para login.
 * - `password`: senha criptografada do usuário.
 * - `role`: papel do usuário (ex: 'user', 'admin'), com padrão 'user'.
 *
 * Relacionamentos:
 * - Um usuário pode ter múltiplas compras associadas.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases: Purchase[];
}
