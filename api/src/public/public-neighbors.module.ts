import { Module } from '@nestjs/common';
import { PublicNeighborsController } from './public-neighbors.controller';

@Module({
  controllers: [PublicNeighborsController],
})
export class PublicNeighborsModule {}
