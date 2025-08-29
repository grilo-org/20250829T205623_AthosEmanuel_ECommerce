import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

/**
 * Controller principal da aplicação.
 * Define a rota raiz que retorna uma mensagem de saudação.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint GET raiz ("/").
   * Retorna uma mensagem simples via AppService.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
