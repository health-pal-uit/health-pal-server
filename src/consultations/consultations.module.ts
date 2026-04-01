import { Module } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './entities/consultation.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consultation, Booking, Expert, ChatSession])],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
})
export class ConsultationsModule {}
