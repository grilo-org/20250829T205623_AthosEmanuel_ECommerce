import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
import { Purchase } from './purchase.entity';

/**
 * Serviço responsável pela lógica de compra de produtos digitais.
 * Gerencia a criação e consulta de compras, garantindo regras de negócio
 * como evitar compras duplicadas e validação da existência de usuários e produtos.
 */
@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Registra uma nova compra associando um usuário a um produto.
   * Antes de salvar, verifica se o usuário já adquiriu o produto para evitar duplicidade.
   * Simulações de pagamento podem ser inseridas aqui antes do registro da compra.
   *
   * @param userId ID do usuário que realizará a compra.
   * @param productId ID do produto que será comprado.
   * @throws Error se o usuário ou produto não existir, ou se a compra já existir.
   * @returns A compra criada, sem o campo `user` para simplificar a resposta.
   */
  async createPurchase(
    userId: number,
    productId: number,
  ): Promise<Omit<Purchase, 'user'>> {
    // Verifica se o usuário já possui uma compra para este produto
    const existingPurchase = await this.purchaseRepository.findOne({
      where: {
        user: { userId },
        product: { id: productId },
      },
    });

    if (existingPurchase) {
      throw new Error('Produto já comprado por este usuário');
    }

    // Busca o usuário pelo ID
    const user = await this.userRepository.findOne({
      where: { userId },
    });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Busca o produto pelo ID
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Cria e salva a nova compra
    const purchase = this.purchaseRepository.create({ user, product });
    const saved = await this.purchaseRepository.save(purchase);

    // Remove o campo `user` da resposta para evitar exposição desnecessária
    const { user: _, ...cleaned } = saved;
    return cleaned;
  }

  /**
   * Recupera todas as compras feitas por um usuário, incluindo os dados dos produtos adquiridos.
   *
   * @param userId ID do usuário.
   * @returns Lista de compras do usuário com os produtos relacionados.
   */
  async getUserPurchases(userId: number): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      where: { user: { userId } },
      relations: ['product'],
    });
  }
}
