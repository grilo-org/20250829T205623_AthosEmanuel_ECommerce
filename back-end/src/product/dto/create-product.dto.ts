import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

/**
 * DTO para criação de um produto.
 *
 * - `title`: título obrigatório do produto.
 * - `description`: descrição opcional do produto.
 * - `price`: preço numérico do produto, deve ser maior ou igual a zero.
 *
 * Validações garantem que os dados recebidos estejam corretos antes do processamento.
 */
export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}
