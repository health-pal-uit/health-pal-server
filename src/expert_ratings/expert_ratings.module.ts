import { Module } from '@nestjs/common';
import { ExpertRatingsService } from './expert_ratings.service';
import { ExpertRatingsController } from './expert_ratings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertRating } from './entities/expert_rating.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { User } from 'src/users/entities/user.entity';
import { Consultation } from 'src/consultations/entities/consultation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertRating, Expert, User, Consultation])],
  controllers: [ExpertRatingsController],
  providers: [ExpertRatingsService],
})
export class ExpertRatingsModule {}
