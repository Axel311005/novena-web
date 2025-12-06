import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class PaginationQueryDto extends PaginationDto {
  @ApiProperty({
    required: false,
    description: 'Search query parameter',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  q?: string;
}

