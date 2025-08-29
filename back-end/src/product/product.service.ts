import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Download } from '../download/download.entity';
import { Purchase } from '../purchase/purchase.entity';
import { User } from '../user/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';

/**
 * Serviço responsável pela gestão dos produtos digitais.
 * Inclui criação, atualização, remoção, listagem e controle de downloads,
 * além da verificação de permissões para acesso ao arquivo do produto.
 */
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Download)
    private readonly downloadRepository: Repository<Download>,
  ) {}

  /**
   * Cria um novo produto digital com arquivo (buffer) obrigatório.
   * @param createProductDto Dados do produto (title, description, price).
   * @param fileBuffer Arquivo PDF do produto em buffer.
   * @throws BadRequestException se o arquivo não for fornecido.
   * @returns Mensagem de sucesso.
   */
  async create(
    createProductDto: CreateProductDto,
    fileBuffer: Buffer,
  ): Promise<{ message: string }> {
    if (!fileBuffer) {
      throw new BadRequestException('Arquivo PDF é obrigatório.');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      file: fileBuffer,
    });

    await this.productRepository.save(product);

    return { message: 'Produto criado com sucesso!' };
  }

  /**
   * Retorna a lista de todos os produtos, omitindo o arquivo (file).
   * Se for passado o userId, inclui a flag `purchased` indicando
   * se o usuário já comprou cada produto.
   * @param userId (opcional) ID do usuário para verificar compras.
   * @returns Lista de produtos com ou sem indicação de compra.
   */
  async findAll(
    userId?: number,
  ): Promise<(Omit<Product, 'file'> & { purchased?: boolean })[]> {
    const products = await this.productRepository.find();

    // Remove o arquivo para não expor o BLOB na resposta
    const productsWithoutFile = products.map(({ file, ...rest }) => rest);

    if (!userId) {
      return productsWithoutFile;
    }

    const purchases = await this.purchaseRepository.find({
      where: { user: { userId } },
      relations: ['product'],
    });

    const purchasedProductIds = new Set(purchases.map((p) => p.product.id));

    return productsWithoutFile.map((product) => ({
      ...product,
      purchased: purchasedProductIds.has(product.id),
    }));
  }

  /**
   * Busca um produto pelo seu ID.
   * @param id ID do produto.
   * @throws NotFoundException se o produto não existir.
   * @returns Produto encontrado.
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return product;
  }

  /**
   * Atualiza os dados de um produto.
   * Proíbe edição se o produto já foi comprado.
   * Permite atualizar opcionalmente o arquivo (buffer).
   * @param id ID do produto.
   * @param updateProductDto Dados para atualização.
   * @param fileBuffer Arquivo opcional para atualização.
   * @throws BadRequestException se produto já foi comprado.
   * @returns Mensagem de sucesso.
   */
  async update(
    id: number,
    updateProductDto: CreateProductDto,
    fileBuffer?: Buffer,
  ): Promise<{ message: string }> {
    const product = await this.findOne(id);

    const existingPurchase = await this.purchaseRepository.findOne({
      where: { product: { id } },
    });

    if (existingPurchase) {
      throw new BadRequestException(
        'Este produto já foi comprado e não pode ser editado.',
      );
    }

    Object.assign(product, updateProductDto);

    if (fileBuffer) {
      product.file = fileBuffer;
    }

    await this.productRepository.save(product);

    return { message: 'Produto editado com sucesso!' };
  }

  /**
   * Remove um produto pelo ID.
   * Impede remoção se o produto já foi comprado (constraints no BD).
   * @param id ID do produto.
   * @throws BadRequestException se o produto não existir ou já foi comprado.
   * @throws InternalServerErrorException para erros inesperados.
   * @returns Mensagem de sucesso.
   */
  async remove(id: number) {
    try {
      const result = await this.productRepository.delete(id);

      if (result.affected === 0) {
        throw new BadRequestException('Produto não encontrado');
      }

      return { message: 'Produto removido com sucesso.' };
    } catch (error) {
      if (
        error.code === 'SQLITE_CONSTRAINT' ||
        error.message?.includes('FOREIGN KEY constraint failed')
      ) {
        throw new BadRequestException(
          'Não é possível excluir o produto, pois ele já foi comprado por um ou mais usuários.',
        );
      }

      throw new InternalServerErrorException('Erro ao remover produto.');
    }
  }

  /**
   * Retorna o arquivo (buffer) do produto para usuários que compraram.
   * Admins têm acesso ilimitado.
   * Controla limite de downloads por usuário (default 3).
   * @param productId ID do produto.
   * @param userId ID do usuário solicitante.
   * @throws ForbiddenException se usuário não autenticado, não encontrado,
   * ou não comprou o produto, ou ultrapassou limite de downloads.
   * @throws NotFoundException se o produto não existir.
   * @returns Buffer do arquivo do produto.
   */
  async getFileIfPurchased(productId: number, userId: number): Promise<Buffer> {
    if (!userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const user = await this.userRepository.findOne({
      where: { userId },
    });
    if (!user) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Admins têm download ilimitado
    if (user.role === 'admin') {
      return product.file;
    }

    // Verifica se o usuário comprou o produto
    const purchase = await this.purchaseRepository.findOne({
      where: { user: { userId }, product: { id: productId } },
    });
    if (!purchase) {
      throw new ForbiddenException('Você não comprou este produto');
    }

    // Verifica ou cria registro de controle de downloads
    let download = await this.downloadRepository.findOne({
      where: { user: { userId }, product: { id: productId } },
    });

    if (!download) {
      download = this.downloadRepository.create({
        user,
        product,
        count: 0,
        maxAllowed: 3, // limite padrão
      });
    }

    if (download.count >= download.maxAllowed) {
      throw new ForbiddenException(
        'Você atingiu o limite de downloads para este produto',
      );
    }

    download.count++;
    await this.downloadRepository.save(download);

    return product.file;
  }

  /**
   * Retorna os produtos comprados por um usuário específico.
   * Exclui o arquivo (blob) dos produtos retornados.
   * @param userId ID do usuário.
   * @throws NotFoundException se usuário não existir.
   * @returns Lista dos produtos adquiridos pelo usuário.
   */
  async findPurchasedByUser(userId: number): Promise<Omit<Product, 'file'>[]> {
    const user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const purchases = await this.purchaseRepository.find({
      where: { user: { userId } },
      relations: ['product'],
    });

    return purchases.map(({ product }) => {
      const { file, ...productWithoutFile } = product;
      return productWithoutFile;
    });
  }
}
