import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { ListActivitiesQueryDto } from './dto/list-activities.query.dto';
import { ListActivitiesResponseDto } from './dto/list-activities.response.dto';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  @ApiQuery({ name: 'plz', required: false, example: '10115' })
  @ApiQuery({ name: 'q', required: false, example: 'coffee' })
  @ApiQuery({ name: 'take', required: false, example: 20 })
  @ApiQuery({
    name: 'cursor',
    required: false,
    example: '1b5f3d0e-1a2b-4c3d-9e0f-123456789abc',
  })
  @ApiQuery({ name: 'category', required: false, example: 'OUTDOOR' })
  @ApiQuery({
    name: 'createdById',
    required: false,
    example: '1b5f3d0e-1a2b-4c3d-9e0f-123456789abc',
  })
  @ApiQuery({
    name: 'startFrom',
    required: false,
    example: '2026-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'startTo',
    required: false,
    example: '2026-02-01T00:00:00.000Z',
  })
  @ApiOkResponse({ type: ListActivitiesResponseDto })
  async list(
    @Query() q: ListActivitiesQueryDto,
  ): Promise<ListActivitiesResponseDto> {
    return this.activities.list(q);
  }
}
