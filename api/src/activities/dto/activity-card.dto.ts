import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory } from './activity-category.enum';
import { UserSummaryDto } from './user-summary.dto';

export class ActivityCardDto {
  @ApiProperty({ example: '1b5f3d0e-1a2b-4c3d-9e0f-123456789abc' })
  id!: string;

  @ApiProperty({ example: 'A walk with happynachbar' })
  title!: string;

  @ApiProperty({ enum: ActivityCategory, example: ActivityCategory.OUTDOOR })
  category!: ActivityCategory;

  @ApiProperty({
    example: '2026-01-09T18:00:00.000Z',
    format: 'date-time',
    description: 'Start timestamp (ISO). Frontend formats as "Heute, 18:00"',
  })
  startAt!: string;

  @ApiPropertyOptional({
    example: 'Prenzlauer Berg',
    description: 'Location label',
  })
  locationLabel?: string;

  @ApiProperty({
    example: '63073',
    description: 'Postal code for locality filtering (leading zeros allowed)',
  })
  plz!: string;

  @ApiProperty({ type: () => UserSummaryDto })
  createdBy!: UserSummaryDto;

  @ApiProperty({ example: '2026-01-09T12:30:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-09T12:30:00.000Z', format: 'date-time' })
  updatedAt!: string;

  // user-context (optional – später für "joined" / favorites)
  @ApiPropertyOptional({ example: false })
  isJoined?: boolean;

  @ApiPropertyOptional({ example: 5 })
  participantsCount?: number;

  @ApiPropertyOptional({ example: false })
  isFavorited?: boolean;

  @ApiPropertyOptional({
    example: 'https://picsum.photos/seed/happynachbar/640/480',
    nullable: true,
  })
  thumbnailUrl?: string | null;
}
