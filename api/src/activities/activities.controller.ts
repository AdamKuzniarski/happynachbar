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
  @ApiQuery({ name: 'cursor', required: false, example: 'act_0001' })
  @ApiQuery({ name: 'category', required: false, example: 'OUTDOOR' })
  @ApiOkResponse({
    type: ListActivitiesResponseDto,
    description: 'Stub feed so Frontend can build UI without DB connection',
  })
  List(@Query() q: ListActivitiesQueryDto): ListActivitiesResponseDto {
    return this.activities.list(q);
  }
}
