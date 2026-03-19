import { Module } from '@nestjs/common';
import { ExpertRatingsService } from './expert_ratings.service';
import { ExpertRatingsController } from './expert_ratings.controller';

@Module({
  controllers: [ExpertRatingsController],
  providers: [ExpertRatingsService],
})
export class ExpertRatingsModule {}
