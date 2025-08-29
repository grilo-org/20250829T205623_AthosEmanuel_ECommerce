import { Injectable } from '@nestjs/common';

/**
 * Serviço principal da aplicação.
 * Fornece métodos básicos, como a mensagem de saudação.
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
