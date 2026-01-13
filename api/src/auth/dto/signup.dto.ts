import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({
    example: 'baby-roth-julia',
    minLength: 8,
    description: 'at least 8 characters',
  })
  password: string;

  @ApiProperty({
    example: 'julia@shark.de',
    minLength: 2,
    maxLength: 50,
    description: 'at least 2 and less than 50 characters',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;
}
