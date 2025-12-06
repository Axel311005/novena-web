import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateAsistenciaDto {
  @ApiProperty({ description: 'ID del niño', example: 1 })
  @IsInt()
  @IsPositive()
  kidId: number;

  @ApiPropertyOptional({
    description: 'Asistencia día 1',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day1?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 2',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day2?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 3',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day3?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 4',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day4?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 5',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day5?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 6',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day6?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 7',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day7?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 8',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day8?: boolean;

  @ApiPropertyOptional({
    description: 'Asistencia día 9',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  day9?: boolean;
}

