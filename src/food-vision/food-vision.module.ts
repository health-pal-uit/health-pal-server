import { Module } from '@nestjs/common';
import { FoodVisionService } from './food-vision.service';
import { FoodVisionController } from './food-vision.controller';

@Module({
  controllers: [FoodVisionController],
  providers: [FoodVisionService],
})
export class FoodVisionModule {}
