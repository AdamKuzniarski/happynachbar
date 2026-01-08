import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({
    example: 'baby roth julia uuasda',
    minLength: 8,
    description: 'at least 8 characters',
  })
  password: string;
}
