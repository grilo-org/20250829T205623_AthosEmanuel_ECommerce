# 🛒 Mini E-commerce React App

Aplicação React moderna para gerenciamento de produtos digitais, com suporte completo para diferentes perfis de usuários (admin e user). A plataforma oferece funcionalidades como cadastro, edição, exclusão, compra e visualização de produtos, além de gerenciamento avançado de usuários e perfis, garantindo uma experiência segura e personalizada para cada tipo de usuário.

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js instalado (versão recomendada: 16+)
- NPM ou Yarn instalado

### Passos para iniciar

1. Clone o repositório e navegue até a pasta do projeto.

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm start
# ou
yarn start
```

4. Abra o navegador e acesse:

```
http://localhost:4000
```

### Credenciais para login como Administrador

- **Email:** admin@example.com
- **Senha:** 0+E9s=0.0dHg

---

## 🧪 Executar testes unitários

Para rodar os testes automatizados, execute:

```bash
npm run test
# ou
yarn test
```

---

## 🧠 Regras de Negócio

Usuário Administrador (ADM) inicial:

Criado automaticamente no primeiro uso do sistema.

Pode criar, editar e excluir produtos.

Pode visualizar e excluir usuários.

Pode baixar produtos PDF sem limite de vezes.

Só pode excluir produtos que nenhum usuário tenha comprado.

Usuário Comum:

Pode se cadastrar livremente, desde que o e-mail e senha cumpram os critérios de validação.

Pode editar seu nome e e-mail (com validação).

Não pode alterar a senha diretamente — deve solicitar suporte.

Pode visualizar e comprar produtos.

Pode baixar produtos adquiridos, com limite de até 4 downloads por produto.

Pode visualizar seus próprios produtos adquiridos e seu perfil.

Segurança e autenticação:

Autenticação baseada em JWT (JSON Web Token).

Todas as requisições à API, exceto login e registro, exigem token válido.

Controle de permissões por perfil (role).

Regras para exclusão de usuários:

Usuários só podem ser excluídos se não tiverem comprado produtos.

Proteção do conteúdo:

Arquivos PDF não podem ser editados, nem pelo administrador.

Download dos arquivos controlado e limitado para usuários comuns.

## ✅ Funcionalidades Principais

Cadastro e login com validação de e-mail e senha forte.

CRUD completo de produtos (admin).

Compra de produtos e controle de acesso para downloads (usuário).

Visualização da lista de produtos e produtos comprados.

Listagem, visualização, edição e exclusão de usuários (admin).

Visualização e edição do perfil do usuário.

Modais intuitivos para editar produtos, editar usuários e confirmar exclusões.

Mensagens de feedback com toast para sucesso e erro.

Navegação protegida e controle dinâmico de componentes baseado na role do usuário.

```

```
