import { Module } from '@nestjs/common';
import { DiscoverCarsController } from './discoverCars.controller';
import { DiscoverCarsService } from './discoverCars.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [DiscoverCarsController],
  providers: [DiscoverCarsService],
  exports: [DiscoverCarsService],
})
export class DiscoverCarsModule {}
