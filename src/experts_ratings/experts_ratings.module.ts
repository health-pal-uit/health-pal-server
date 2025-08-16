import { Module } from '@nestjs/common';
import { ExpertsRatingsService } from './experts_ratings.service';
import { ExpertsRatingsController } from './experts_ratings.controller';

@Module({
  controllers: [ExpertsRatingsController],
  providers: [ExpertsRatingsService],
})
export class ExpertsRatingsModule {}
