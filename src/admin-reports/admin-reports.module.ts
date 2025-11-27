import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminReportsService } from './admin-reports.service';
import { AdminReportsController } from './admin-reports.controller';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, DailyLog, Ingredient, Meal, Challenge, PremiumPackage]),
  ],
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
})
export class AdminReportsModule {}
