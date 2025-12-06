import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'email', example: 'juanito32@gmail.com' })
  @IsString()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  @Matches(
    /^[a-zA-Z0-9._%+-]{6,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    {
      message: 'El correo debe tener al menos 6 caracteres antes del @'
    }
  )
  email: string;

  @ApiProperty({ description: 'contraseña', example: 'Juanito1234' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;
}
