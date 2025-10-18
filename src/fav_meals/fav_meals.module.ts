import { Module } from '@nestjs/common';
import { FavMealsService } from './fav_meals.service';
import { FavMealsController } from './fav_meals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavMeal } from './entities/fav_meal.entity';
import { User } from 'src/users/entities/user.entity';
import { Meal } from 'src/meals/entities/meal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavMeal, User, Meal])],
  controllers: [FavMealsController],
  providers: [FavMealsService],
})
export class FavMealsModule {}
