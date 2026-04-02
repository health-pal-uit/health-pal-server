import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { User } from 'src/users/entities/user.entity';
import { Consultation } from 'src/consultations/entities/consultation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Expert, User, Consultation])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
