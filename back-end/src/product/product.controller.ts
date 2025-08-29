import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';

/**
 * Controller para gerenciamento dos produtos digitais.
 * Rotas protegidas por autenticação JWT e controle de roles.
 */
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Cria um novo produto digital com arquivo PDF.
   * Somente usuários com role 'admin' podem acessar.
   */
  @Post()
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo PDF é obrigatório');
    }

    return this.productService.create(createProductDto, file.buffer);
  }

  /**
   * Retorna todos os produtos disponíveis.
   * Se usuário autenticado, marca os produtos que ele já comprou.
   */
  @Get()
  async findAll(@Request() req) {
    const userId = req.user?.userId;
    return this.productService.findAll(userId);
  }

  /**
   * Retorna os detalhes de um produto pelo seu ID.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  /**
   * Atualiza um produto existente.
   * Permite enviar um novo arquivo PDF opcionalmente.
   * Apenas admins podem executar essa operação.
   */
  @Patch(':id')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.update(id, updateProductDto, file?.buffer);
  }

  /**
   * Retorna o arquivo PDF de um produto se o usuário tiver comprado ou for admin.
   * O arquivo é enviado como resposta para download.
   */
  @Get(':id/file')
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res() res: Response,
  ) {
    const userId = req.user?.userId;
    try {
      const fileBuffer = await this.productService.getFileIfPurchased(
        id,
        userId,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="produto_${id}.pdf"`,
      });

      return res.send(fileBuffer);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
  }

  /**
   * Retorna a lista de produtos comprados por um usuário.
   * Recebe o ID do usuário como parâmetro na URL.
   */
  @Get('purchased/:userId')
  async getPurchasedProducts(@Param('userId', ParseIntPipe) userId: number) {
    return this.productService.findPurchasedByUser(userId);
  }

  /**
   * Remove um produto pelo ID.
   * Apenas admins podem executar essa operação.
   */
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
