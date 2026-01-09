import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCardDto } from './activity-card.dto';
import { ActivityImageDto } from './activity-image.dto';

export class ActivityDetailDto extends ActivityCardDto {
  @ApiPropertyOptional({ example: 'We walk together and talk, talk, talk!' })
  description?: string;

  @ApiProperty({ type: () => [ActivityImageDto] })
  images!: ActivityCardDto[];
}
