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

  async removeByUserAndMeal(userId: string, mealId: string): Promise<DeleteResult> {
    return await this.favMealRepository.delete({ user: { id: userId }, meal: { id: mealId } });
  }
  async findAllOfUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: { id: string; meal: Meal }[]; total: number; page: number; limit: number }> {
    const [favMeal, total] = await this.favMealRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['meal'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    const data = favMeal.map((fav) => ({ id: fav.id, meal: fav.meal }));
    return { data, total, page, limit };
  }
  async create(createFavMealDto: CreateFavMealDto) {
    const user = await this.userRepository.findOne({ where: { id: createFavMealDto.user_id } });
    const meal = await this.mealRepository.findOne({ where: { id: createFavMealDto.meal_id } });
    if (!user || !meal) {
      throw new Error('User or meal not found');
    }
    // Check for duplicate
    const existing = await this.favMealRepository.findOne({
      where: { user: { id: user.id }, meal: { id: meal.id } },
    });
    if (existing) {
      throw new Error('Already favorited');
    }
    const favMeal = this.favMealRepository.create();
    favMeal.user = user;
    favMeal.meal = meal;
    return this.favMealRepository.save(favMeal);
  }

  async isFavorited(userId: string, mealId: string): Promise<boolean> {
    const fav = await this.favMealRepository.findOne({
      where: { user: { id: userId }, meal: { id: mealId } },
    });
    return !!fav;
  }
}
