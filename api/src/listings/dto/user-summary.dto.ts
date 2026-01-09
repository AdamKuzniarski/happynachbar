import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryDTO {
  @ApiProperty({ example: '1b5f3d0e-1a2b-4c3d-9e0f-123456789abc' })
  id!: string;

  @ApiProperty({ example: 'Julia S.' })
  displayName!: string;
}
