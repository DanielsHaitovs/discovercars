import { Module } from '@nestjs/common';
import { BookingService } from './services/booking.service';
import { BookingController } from './controllers/booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
