import * as bcrypt from 'bcryptjs';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Importa o Swagger para documentação

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { User } from './user/user.entity';

/**
 * Função que cria um usuário admin padrão caso ele não exista no banco.
 * Isso garante acesso administrativo inicial à aplicação.
 * @param dataSource Instância do DataSource do TypeORM para acessar o repositório.
 */
async function createAdminIfNotExists(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const adminExists = await userRepository.findOneBy({
    email: 'admin@example.com',
  });

  if (!adminExists) {
    const admin = userRepository.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('0+E9s=0.0dHg', 10),
      role: 'admin',
    });

    await userRepository.save(admin);
    console.log('✅ Usuário admin criado com sucesso!');
  } else {
    console.log('ℹ️ Admin já existe. Nenhuma ação necessária.');
  }
}

/**
 * Função principal que inicializa a aplicação NestJS.
 * Configura validação global, CORS, Swagger e cria o admin inicial.
 */
async function bootstrap() {
  // Cria a aplicação NestJS
  const app = await NestFactory.create(AppModule);

  // Obtém a instância do DataSource para acesso ao banco
  const dataSource = app.get(DataSource);

  // Cria o usuário admin se não existir
  await createAdminIfNotExists(dataSource);

  // Configura validação global para DTOs com whitelist e transformações
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas nos DTOs
      forbidNonWhitelisted: true, // retorna erro se houver propriedades extras
      transform: true, // converte automaticamente tipos nas requisições
    }),
  );

  // Configuração do CORS para aceitar requisições do frontend local
  const port = process.env.PORT || 4000;
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Configura documentação Swagger da API
  const config = new DocumentBuilder()
    .setTitle('API E-commerce Digital')
    .setDescription('API para gerenciamento e compra de produtos digitais')
    .setVersion('1.0')
    .addBearerAuth() // adiciona suporte para autenticação JWT no Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Inicia o servidor HTTP na porta configurada
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 Swagger docs available at http://localhost:${port}/api-docs`);
}

// Executa a função principal para inicializar a aplicação
bootstrap();
