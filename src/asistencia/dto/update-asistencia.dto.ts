import { PartialType } from '@nestjs/swagger';
import { CreateAsistenciaDto } from './create-asistencia.dto';
import { IsInt, IsPositive, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAsistenciaDto extends PartialType(CreateAsistenciaDto) {
  @ApiPropertyOptional({ description: 'ID del niño', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  kidId?: number;
}

