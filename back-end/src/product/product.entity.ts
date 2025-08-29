import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Purchase } from '../purchase/purchase.entity';

/**
 * Entidade que representa um produto digital disponível para compra.
 *
 * Campos principais:
 * - `title`: nome do produto.
 * - `description`: descrição opcional do produto.
 * - `price`: preço do produto (número com ponto flutuante).
 * - `file`: arquivo do produto armazenado como BLOB (buffer) no banco.
 *
 * Relacionamentos:
 * - `purchases`: lista das compras associadas a esse produto.
 */

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  price: number;

  @Column({ type: 'blob', nullable: false })
  file: Buffer;

  @OneToMany(() => Purchase, (purchase) => purchase.product)
  purchases: Purchase[];
}
