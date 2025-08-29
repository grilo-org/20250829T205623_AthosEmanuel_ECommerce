import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

/**
 * Serviço responsável pela lógica de negócio relacionada aos usuários.
 *
 * Fornece métodos para criar, buscar, listar, atualizar e remover usuários,
 * incluindo regras específicas como impedir exclusão de usuários com compras associadas.
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  /**
   * Cria e salva um novo usuário no banco de dados.
   * @param data Dados parciais do usuário para criação.
   * @returns O usuário criado.
   */
  create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  /**
   * Busca um usuário pelo e-mail.
   * Útil para processos de autenticação e verificação.
   * @param email E-mail do usuário.
   * @returns O usuário encontrado ou undefined.
   */
  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  /**
   * Retorna todos os usuários com papel 'user'.
   * Seleciona apenas campos essenciais para exibição.
   * @returns Lista de usuários comuns.
   */
  async findAll() {
    return this.repo.find({
      where: { role: 'user' },
      select: ['userId', 'name', 'email', 'role'],
    });
  }

  /**
   * Remove um usuário pelo ID.
   * Impede exclusão se o usuário possuir compras associadas.
   * @param userId ID do usuário a ser removido.
   * @throws Error se usuário não existir ou possuir compras.
   * @returns O usuário removido.
   */
  async remove(userId: number) {
    const user = await this.repo.findOne({
      where: { userId },
      relations: ['purchases'],
    });

    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado`);
    }

    if (user.purchases && user.purchases.length > 0) {
      throw new Error(
        `Usuário não pode ser excluído porque possui compras associadas.`,
      );
    }

    return this.repo.remove(user);
  }

  /**
   * Busca os dados do usuário autenticado pelo ID.
   * @param userId ID do usuário.
   * @returns O usuário encontrado.
   */
  async findMe(userId: number) {
    return this.repo.findOne({ where: { userId } });
  }

  /**
   * Atualiza os dados do usuário autenticado.
   * @param userId ID do usuário.
   * @param data Dados parciais para atualização.
   * @throws Error se userId não for fornecido.
   * @returns O usuário atualizado.
   */
  async updateMe(userId: number, data: Partial<User>) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    await this.repo.update({ userId }, data);
    return this.findMe(userId);
  }
}
