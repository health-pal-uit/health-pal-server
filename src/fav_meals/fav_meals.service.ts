import { Injectable } from '@nestjs/common';
import { CreateFavMealDto } from './dto/create-fav_meal.dto';
import { UpdateFavMealDto } from './dto/update-fav_meal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FavMeal } from './entities/fav_meal.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Meal } from 'src/meals/entities/meal.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FavMealsService {
  constructor(
    @InjectRepository(FavMeal) private favMealRepository: Repository<FavMeal>,
    @InjectRepository(Meal) private mealRepository: Repository<Meal>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async remove(id: string): Promise<DeleteResult> {
    return await this.favMealRepository.delete(id);
  }
  async findAllOfUser(userId: string): Promise<Meal[]> {
    const favMeal = await this.favMealRepository.find({
      where: { user: { id: userId } },
      relations: ['meal'],
    });
    return favMeal.map((fav) => fav.meal);
  }
  async create(createFavMealDto: CreateFavMealDto) {
    const user = await this.userRepository.findOne({ where: { id: createFavMealDto.user_id } });
    const meal = await this.mealRepository.findOne({ where: { id: createFavMealDto.meal_id } });
    if (!user || !meal) {
      throw new Error('User or meal not found');
    }
    const favMeal = this.favMealRepository.create();
    favMeal.user = user;
    favMeal.meal = meal;
    return this.favMealRepository.save(favMeal);
  }
}
