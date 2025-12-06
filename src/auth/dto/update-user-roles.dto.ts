import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { ValidRoles } from '../interfaces/valid-roles';

export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'Lista de roles a asignar al usuario',
    isArray: true,
    enum: ValidRoles,
    example: ['vendedor'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ValidRoles, { each: true })
  roles: ValidRoles[];
}
