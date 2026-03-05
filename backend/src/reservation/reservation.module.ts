import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { UserModule } from 'src/user/user.module';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports: [HttpModule, UserModule, BookingModule],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
