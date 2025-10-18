import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDailyMealDto } from './dto/create-daily_meal.dto';
import { UpdateDailyMealDto } from './dto/update-daily_meal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyMeal } from './entities/daily_meal.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { DailyLogsService } from 'src/daily_logs/daily_logs.service';

@Injectable()
export class DailyMealsService {
  constructor(
    @InjectRepository(DailyMeal) private dailyMealsRepository: Repository<DailyMeal>,
    @InjectRepository(DailyLog) private dailyLogsRepository: Repository<DailyLog>,
    @InjectRepository(Meal) private mealsRepository: Repository<Meal>,
    private dailyLogsService: DailyLogsService,
  ) {}

  async findAllByUser(userId: string): Promise<DailyMeal[]> {
    return await this.dailyMealsRepository.find({ where: { daily_log: { user: { id: userId } } } });
  }
  async create(createDailyMealDto: CreateDailyMealDto, userId: string): Promise<DailyMeal> {
    const meal = await this.mealsRepository.findOne({ where: { id: createDailyMealDto.meal_id } });
    // const dailyLog = await this.dailyLogsRepository.findOne({ where: { id: createDailyMealDto.daily_log_id } });
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(
      userId,
      createDailyMealDto.logged_at ?? new Date(),
    );
    if (!meal) {
      throw new Error('Meal not found');
    }
    if (!dailyLog) {
      throw new Error('Daily log not found');
    }
    if (createDailyMealDto.serving) {
      if (!meal.serving_gr) {
        throw new Error('Meal has no serving size defined');
      }
      const kgPerServing = meal.serving_gr / 1000;
      const scale = createDailyMealDto.serving * kgPerServing * 10; // kg -> 100gr

      const macros = {
        total_kcal: meal.kcal_per_100gr * scale,
        total_protein_gr: meal.protein_per_100gr * scale,
        total_fat_gr: meal.fat_per_100gr * scale,
        total_carbs_gr: meal.carbs_per_100gr * scale,
        total_fiber_gr: meal.fiber_per_100gr * scale,
      } satisfies Pick<
        CreateDailyMealDto,
        'total_kcal' | 'total_protein_gr' | 'total_fat_gr' | 'total_carbs_gr' | 'total_fiber_gr'
      >;
      const payload: CreateDailyMealDto = {
        ...createDailyMealDto,
        ...macros,
        logged_at: createDailyMealDto.logged_at ?? new Date(),
      };
      const dailyMeal = this.dailyMealsRepository.create({ ...payload, meal, daily_log: dailyLog });
      const saved = await this.dailyMealsRepository.save(dailyMeal);
      await this.dailyLogsService.recalculateDailyLogMacros(dailyLog.id);
      return saved;
    } else if (createDailyMealDto.quantity_kg) {
      const scale = createDailyMealDto.quantity_kg * 10; // kg -> 100gr

      const macros = {
        total_kcal: meal.kcal_per_100gr * scale,
        total_protein_gr: meal.protein_per_100gr * scale,
        total_fat_gr: meal.fat_per_100gr * scale,
        total_carbs_gr: meal.carbs_per_100gr * scale,
        total_fiber_gr: meal.fiber_per_100gr * scale,
      } satisfies Pick<
        CreateDailyMealDto,
        'total_kcal' | 'total_protein_gr' | 'total_fat_gr' | 'total_carbs_gr' | 'total_fiber_gr'
      >;
      const payload: CreateDailyMealDto = {
        ...createDailyMealDto,
        ...macros,
        logged_at: createDailyMealDto.logged_at ?? new Date(),
      };
      const dailyMeal = this.dailyMealsRepository.create({ ...payload, meal, daily_log: dailyLog });
      const saved = await this.dailyMealsRepository.save(dailyMeal);
      await this.dailyLogsService.recalculateDailyLogMacros(dailyLog.id);
      return saved;
    } else {
      throw new Error('Either serving or quantity_kg must be provided');
    }
  }

  async createMany(
    createDailyMealDtos: CreateDailyMealDto[],
    userId: string,
  ): Promise<DailyMeal[]> {
    const dailyMealList: DailyMeal[] = [];
    for (const dto of createDailyMealDtos) {
      const dailyMeal = await this.create(dto, userId);
      dailyMealList.push(dailyMeal);
    }
    return dailyMealList;
  }

  async findAll(): Promise<DailyMeal[]> {
    return await this.dailyMealsRepository.find();
  }

  async findOneOwned(id: string, userId: string): Promise<DailyMeal | null> {
    return await this.dailyMealsRepository
      .findOne({ where: { id }, relations: { daily_log: true } })
      .then((dailyMeal) => {
        if (dailyMeal?.daily_log.user.id !== userId) {
          throw new ForbiddenException('Access denied');
        }
        return dailyMeal;
      });
  }

  async updateOneOwned(
    id: string,
    updateDailyMealDto: UpdateDailyMealDto,
    userId: string,
  ): Promise<UpdateResult> {
    const dailyMeal = await this.findOneOwned(id, userId);
    if (!dailyMeal) {
      throw new ForbiddenException('Access denied');
    }
    return await this.dailyMealsRepository.update(
      { id, daily_log: { user: { id: userId } } },
      updateDailyMealDto,
    );
  }

  async removeOwned(id: string, userId: string): Promise<DeleteResult> {
    const dailyMeal = await this.findOneOwned(id, userId);
    if (!dailyMeal) {
      throw new ForbiddenException('Access denied');
    }
    return await this.dailyMealsRepository.delete({ id, daily_log: { user: { id: userId } } });
  }
}
