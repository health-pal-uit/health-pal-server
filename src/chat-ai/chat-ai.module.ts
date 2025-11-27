import { Module } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ChatAiController } from './chat-ai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from 'src/meals/entities/meal.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal, Ingredient, Activity, Challenge, Medal, PremiumPackage]),
  ],
  controllers: [ChatAiController],
  providers: [ChatAiService],
})
export class ChatAiModule {}
