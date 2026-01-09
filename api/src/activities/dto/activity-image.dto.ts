import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityImageDto {
  @ApiProperty({ example: 'https://picsum.photos/seed/happynachbar/800/600' })
  url!: string;

  @ApiProperty({ example: 0, description: 'Lower comes first' })
  sortOrder!: number;

  @ApiPropertyOptional({ example: 'Example alt description for your picture' })
  alt?: string;
}
