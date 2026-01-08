import { IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeDto {
  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'plz must be exactly 5 digits' })
  @ApiPropertyOptional({
    example: '63073',
    description: 'German postal code (PLZ)',
    pattern: '^\\d{5}$',
  })
  plz?: string;
}
