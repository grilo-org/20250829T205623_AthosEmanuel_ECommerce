<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descrição

Backend construído com NestJS para um e-commerce especializado na venda de eBooks em formato PDF.

Utiliza SQLite como banco de dados leve e portátil, gerenciado por um ORM (TypeORM ou Prisma), garantindo flexibilidade e facilidade de manutenção.

O sistema oferece gerenciamento completo de usuários com perfis distintos (administrador e usuário comum), controle rigoroso de permissões via roles, e autenticação segura baseada em tokens JWT.

Inclui regras de negócio específicas para criação, edição, exclusão e compra de produtos digitais, assim como controle detalhado de downloads para proteger os direitos autorais e assegurar limites de acesso aos conteúdos adquiridos.

---

## 🚀 Como rodar o projeto

```bash
npm install
npm run start:dev
```

## Scripts disponíveis

# Rodar o servidor em modo desenvolvimento (watch)

npm run start:dev

# Rodar o servidor em modo produção

npm run start:prod

# Executar testes unitários

npm run test

# Gerar relatório de cobertura dos testes

npm run test:cov

## 🧠 Regras de Negócio

### Estrutura e Relacionamentos

- O banco de dados possui as tabelas principais:
  - **User**: controla os usuários do sistema, incluindo o administrador (ADM).
  - **Product**: representa os produtos digitais disponíveis (e.g. ebooks).
  - **Purchase**: registra a compra de produtos por usuários (1 usuário pode comprar vários produtos).
  - **Download**: controla a quantidade de downloads de um produto comprado por um usuário (limite de downloads).

- Para associar um produto a um usuário comprador, as tabelas **Purchase** e **Download** armazenam os `userId` e `productId`.

- Ao listar produtos para o usuário, o sistema marca quais produtos já foram comprados e exibe a quantidade de downloads restantes.

---

### Cadastro e Autenticação

-O sistema inicia automaticamente com um usuário administrador (ADM) criado na primeira inicialização, com as credenciais padrão:

- Email: admin@example.com
- Senha: 0+E9s=0.0dHg

- Usuários podem se cadastrar livremente via API, com validação rigorosa:
  - Email válido e único.
  - Senha forte (mínimo 8 caracteres, maiúsculas, minúsculas, números e caracteres especiais).

- Senhas são armazenadas apenas em forma **hashed** com bcrypt (não armazenar texto puro).

- Senhas **não podem ser alteradas** diretamente pela API por segurança; qualquer alteração deve ser feita via processo de suporte/admin.

- O sistema usa **JWT** para autenticação:
  - Login gera token JWT com payload que inclui `userId`, `email` e `role`.
  - Todas as rotas protegidas exigem token válido.
  - Roles (`admin` ou `user`) definem permissões de acesso.

---

### Produtos e Compras

- Somente o ADM pode criar, editar e excluir produtos.

- O arquivo PDF (armazenado como BLOB no banco) é enviado no momento da criação e **não pode ser editado** após o upload, para garantir integridade do conteúdo.

- O ADM só pode excluir um produto se **nenhum usuário** tiver comprado o produto (integridade referencial).

- Os usuários só podem comprar produtos que existem e que estão disponíveis no catálogo.

---

### Usuários

- O ADM pode listar todos os usuários e excluir usuários.

- Um usuário só pode ser excluído se **não possuir compras associadas** para evitar inconsistências e perdas de dados.

- Usuários comuns só podem visualizar e atualizar seus próprios dados (exceto senha).

---

### Downloads

- Após a compra de um produto, o sistema controla o número de downloads permitidos por usuário, com limite configurável (exemplo padrão: 3 downloads).

- O ADM tem download ilimitado para todos os produtos.

- Se o usuário atingir o limite de downloads de um produto, não poderá mais baixá-lo, salvo renovação da compra ou extensão.

---

### Segurança e Boas Práticas

- Controle de acesso baseado em roles com guards nas rotas e validação nos serviços para evitar que usuários não autorizados executem ações restritas.

- Validação e sanitização de dados rigorosa via `class-validator` e `ValidationPipe` global para evitar entrada inválida ou maliciosa.

- Tratamento consistente de erros e exceções para retorno claro ao cliente sem vazamento de informações sensíveis.

- Logs para ações críticas (exemplo: criação/exclusão de usuário, compra de produto) podem ser implementados para auditoria futura.

---
