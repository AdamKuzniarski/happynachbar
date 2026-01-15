import { ApiProperty } from '@nestjs/swagger';
import { ActivityCardDto } from './activity.dto';

export class ListActivitiesResponseDto {
  @ApiProperty({ type: () => [ActivityCardDto] })
  items!: ActivityCardDto[];

  @ApiProperty({
    example: null,
    nullable: true,
    type: String,
    description: 'If null => no more pages',
  })
  nextCursor!: string | null;
}
