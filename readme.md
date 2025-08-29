# Mini E-commerce de eBooks (PDF) - Fullstack

## Visão Geral

Este é um projeto completo de mini e-commerce especializado na venda de eBooks em formato PDF, composto por:

- **Backend:** Construído com NestJS, com banco de dados SQLite e ORM (TypeORM ou Prisma), oferecendo gerenciamento de usuários, produtos digitais, compras, downloads e controle de permissões via autenticação JWT.
- **Frontend:** Aplicação React moderna que permite a interação dos usuários com o sistema, incluindo cadastro, login, gerenciamento de produtos (para administradores), compra e download dos eBooks.

---

## Tecnologias Utilizadas

| Camada    | Tecnologia                                 |
| --------- | ------------------------------------------ |
| Backend   | NestJS, SQLite, TypeORM/Prisma, JWT        |
| Frontend  | React, Material UI, React Router           |
| Segurança | Bcrypt para hashing, JWT para autenticação |

---

## Funcionalidades Principais

### Backend

- Usuários com perfis distintos: administrador (ADM) e usuário comum.
- Autenticação segura via JWT com roles para controle de acesso.
- Cadastro e validação rigorosa de usuários (e-mail único, senha forte).
- CRUD de produtos digitais (PDF) feito apenas pelo administrador.
- Upload de arquivos PDF armazenados como BLOB; PDFs não podem ser editados após upload.
- Sistema de compras que relaciona usuários e produtos adquiridos.
- Controle rigoroso de downloads por produto comprado (limite configurável).
- Regras de exclusão: produtos e usuários só podem ser excluídos se não houver dependências (compras associadas).
- Logs e tratamento consistente de erros.

### Frontend

- Interface para cadastro, login e gerenciamento de perfil.
- Visualização do catálogo de produtos com destaque para os adquiridos.
- Funcionalidades específicas para administrador: criar, editar e excluir produtos, listar e excluir usuários.
- Compra de produtos com controle visual e confirmação.
- Download controlado dos eBooks conforme limite de uso.
- Modais para edição, exclusão e confirmação de ações.
- Feedback visual usando notificações toast.
- Navegação protegida com controle de acesso dinâmico baseado no perfil do usuário.

---

## Regras de Negócio Resumidas

| Aspecto       | Descrição                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| Usuário Admin | Criado automaticamente na primeira inicialização; controla produtos e usuários; downloads ilimitados.               |
| Usuário Comum | Pode se cadastrar livremente, comprar e baixar produtos com limite de downloads; pode editar perfil (exceto senha). |
| Produtos      | PDFs enviados pelo ADM, imutáveis após upload; só podem ser excluídos se não houver compras.                        |
| Compras       | Registradas por usuário e produto; permitem controle de downloads.                                                  |
| Downloads     | Limite padrão para usuários comuns (ex: 3 ou 4 downloads por produto).                                              |
| Segurança     | JWT para autenticação; bcrypt para senhas; validação de entrada rigorosa; roles para proteção de rotas.             |

---

## Como Rodar o Projeto

### Backend (NestJS)

```bash
cd back-end
npm install
npm run start:dev
```

Servidor rodará em modo desenvolvimento, geralmente em `http://localhost:3000`.

---

### Frontend (React)

```bash
cd front-end
npm install
npm start
```

Aplicação abrirá no navegador em `http://localhost:4000`.

---

## Credenciais Administrativas Padrão

- **Email:** [admin@example.com](mailto:admin@example.com)
- **Senha:** 0+E9s=0.0dHg

---

## Comandos Úteis

### Backend

- `npm run start:dev` - inicia servidor em modo desenvolvimento (watch).
- `npm run start:prod` - inicia servidor em produção.
- `npm run test` - executa testes unitários.
- `npm run test:cov` - gera relatório de cobertura dos testes.

### Frontend

- `npm start` - inicia app em modo desenvolvimento.
- `npm test` - executa testes automatizados.

---

## Observações

- A senha dos usuários é armazenada somente em formato hashed, com bcrypt.
- Senha não pode ser alterada via API diretamente, apenas via suporte/admin.
- Arquivos PDF são imutáveis após upload para garantir integridade.
- Downloads são limitados para usuários comuns e ilimitados para o admin.
- Todas as rotas protegidas do backend exigem token JWT válido.
- O frontend apresenta controle de rotas e componentes baseado na role do usuário.
