import { IsOptional, Matches } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'plz must be exactly 5 digits' })
  plz?: string;
}
