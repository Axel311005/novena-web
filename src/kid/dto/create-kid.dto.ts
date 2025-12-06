import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsPositive,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Sexo } from '../../common/enums';

export class CreateKidDto {
  @ApiPropertyOptional({
    description: 'Primer nombre del niño',
    example: 'Juan',
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  primerNombre?: string | null;

  @ApiPropertyOptional({
    description: 'Segundo nombre del niño',
    example: 'Carlos',
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  segundoNombre?: string | null;

  @ApiPropertyOptional({
    description: 'Primer apellido del niño',
    example: 'Pérez',
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  primerApellido?: string | null;

  @ApiPropertyOptional({
    description: 'Segundo apellido del niño',
    example: 'García',
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  segundoApellido?: string | null;

  @ApiProperty({ description: 'Edad del niño', example: 8 })
  @IsInt()
  @IsPositive()
  edad: number;

  @ApiProperty({
    description: 'Sexo del niño',
    example: 'masculino',
    enum: Sexo,
  })
  @IsEnum(Sexo, {
    message: 'El sexo debe ser "masculino" o "femenino"',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    }
    return value;
  })
  sexo: Sexo;
}

