import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchaseService } from './purchase.service';

/**
 * Controller responsável por gerenciar as rotas relacionadas às compras de produtos digitais.
 * Todas as rotas são protegidas por autenticação JWT.
 */
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  /**
   * Endpoint para criação de uma nova compra.
   * O usuário autenticado é identificado via JWT (disponível em @Request()).
   * Recebe o `productId` no corpo da requisição para registrar a compra.
   * @throws BadRequestException em caso de falha na criação da compra.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body('productId') productId: number) {
    const userId = req.user.userId;
    try {
      return await this.purchaseService.createPurchase(userId, productId);
    } catch (error) {
      throw new BadRequestException(error.message || 'Erro ao realizar compra');
    }
  }

  /**
   * Endpoint para listar todas as compras realizadas pelo usuário autenticado.
   * O userId é extraído do token JWT via @Request().
   * @returns Lista de compras do usuário.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserPurchases(@Request() req) {
    const userId = req.user.userId;
    return this.purchaseService.getUserPurchases(userId);
  }
}
