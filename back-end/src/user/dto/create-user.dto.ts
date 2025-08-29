import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

/**
 * DTO para cadastro de usuário, com validações rigorosas para garantir
 * integridade e segurança dos dados fornecidos.
 *
 * Validações aplicadas:
 * - `name`: obrigatório e não pode ser vazio.
 * - `email`: deve ser um endereço de e-mail válido.
 * - `password`: deve conter pelo menos 8 caracteres, incluindo
 *   pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.
 */
export class CreateUserDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message:
      'A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial',
  })
  password: string;
}
