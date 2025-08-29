import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

/**
 * DTO para atualização parcial dos dados do usuário.
 * Todos os campos são opcionais para permitir atualizações parciais.
 *
 * Validações aplicadas:
 * - `name`: se fornecido, deve ser uma string.
 * - `email`: se fornecido, deve ser um e-mail válido.
 * - `password`: se fornecido, deve conter pelo menos 8 caracteres,
 *   incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email?: string;

  @IsOptional()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message:
      'A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial',
  })
  password?: string;
}
