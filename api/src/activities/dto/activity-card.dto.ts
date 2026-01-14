import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory } from './activity-category.enum';
import { UserSummaryDto } from './user-summary.dto';

export class ActivityCardDto {
  @ApiProperty({ example: 'lst-1231dsf-123-fsd5', format: 'uuid' })
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
  startAt!: Date;

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
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-09T12:30:00.000Z', format: 'date-time' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: false,
    description: 'Optional user-context field - has the user joined',
  })
  isJoined?: boolean;

  @ApiPropertyOptional({
    example: 5,
    description: 'Optional: number of participants',
  })
  participantsCount?: number;

  @ApiPropertyOptional({ example: false })
  isFavorited?: boolean;

  @ApiPropertyOptional({
    example: 'https://picsum.photos/seed/happynachbar/640/480',
    nullable: true,
    format: 'uri',
    type: String,
  })
  thumbnailUrl?: string | null;
}
