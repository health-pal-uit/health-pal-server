import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDailyMealDto } from './dto/create-daily_meal.dto';
import { UpdateDailyMealDto } from './dto/update-daily_meal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyMeal } from './entities/daily_meal.entity';
import { Repository } from 'typeorm';
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

  async findAllByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: DailyMeal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.dailyMealsRepository.findAndCount({
      where: { daily_log: { user: { id: userId } } },
      skip: (page - 1) * limit,
      take: limit,
      order: { logged_at: 'DESC' },
    });
    return { data, total, page, limit };
  }
  async create(createDailyMealDto: CreateDailyMealDto, userId: string): Promise<DailyMeal> {
    // Accept legacy/alternate keys from tests
    const portionSize: number | undefined = (createDailyMealDto as any).portion_size;
    const consumedAt: Date | string | undefined = (createDailyMealDto as any).consumed_at;
    const normalizedMealType =
      typeof createDailyMealDto.meal_type === 'string'
        ? (createDailyMealDto.meal_type as string).toLowerCase()
        : createDailyMealDto.meal_type;

    const effectiveLoggedAt =
      createDailyMealDto.logged_at ?? (consumedAt ? new Date(consumedAt) : new Date());
    const effectiveServing = createDailyMealDto.serving ?? portionSize;
    const effectiveQuantity = createDailyMealDto.quantity_kg ?? effectiveServing;

    // meal_id is optional - find meal if provided
    const meal = createDailyMealDto.meal_id
      ? await this.mealsRepository.findOne({ where: { id: createDailyMealDto.meal_id } })
      : null;

    // If meal_id was provided but meal not found, throw error
    if (createDailyMealDto.meal_id && !meal) {
      throw new NotFoundException('Meal not found');
    }

    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(userId, effectiveLoggedAt);
    if (!dailyLog) {
      throw new NotFoundException('Daily log not found');
    }
    if (!dailyLog) {
      throw new NotFoundException('Daily log not found');
    }
    if (effectiveServing) {
      if (meal && !meal.serving_gr) {
        throw new Error('Meal has no serving size defined');
      }
      const kgPerServing = meal && meal.serving_gr ? meal.serving_gr / 1000 : 0;
      const scale = effectiveServing * kgPerServing * 10; // kg -> 100gr

      const macros = {
        total_kcal: meal ? (meal.kcal_per_100gr ?? 0) * scale : 0,
        total_protein_gr: meal ? (meal.protein_per_100gr ?? 0) * scale : 0,
        total_fat_gr: meal ? (meal.fat_per_100gr ?? 0) * scale : 0,
        total_carbs_gr: meal ? (meal.carbs_per_100gr ?? 0) * scale : 0,
        total_fiber_gr: meal ? (meal.fiber_per_100gr ?? 0) * scale : 0,
      } satisfies Pick<
        CreateDailyMealDto,
        'total_kcal' | 'total_protein_gr' | 'total_fat_gr' | 'total_carbs_gr' | 'total_fiber_gr'
      >;
      const payload: CreateDailyMealDto = {
        ...createDailyMealDto,
        ...macros,
        meal_type: normalizedMealType as any,
        logged_at: effectiveLoggedAt,
        serving: effectiveServing,
      };
      const dailyMeal = this.dailyMealsRepository.create({
        ...payload,
        ...(meal && { meal }),
        daily_log: dailyLog,
      });
      const saved = await this.dailyMealsRepository.save(dailyMeal);
      await this.dailyLogsService.recalculateDailyLogMacros(dailyLog.id);
      return saved;
    } else if (effectiveQuantity) {
      const scale = effectiveQuantity * 10; // kg -> 100gr

      const macros = {
        total_kcal: meal ? (meal.kcal_per_100gr ?? 0) * scale : 0,
        total_protein_gr: meal ? (meal.protein_per_100gr ?? 0) * scale : 0,
        total_fat_gr: meal ? (meal.fat_per_100gr ?? 0) * scale : 0,
        total_carbs_gr: meal ? (meal.carbs_per_100gr ?? 0) * scale : 0,
        total_fiber_gr: meal ? (meal.fiber_per_100gr ?? 0) * scale : 0,
      } satisfies Pick<
        CreateDailyMealDto,
        'total_kcal' | 'total_protein_gr' | 'total_fat_gr' | 'total_carbs_gr' | 'total_fiber_gr'
      >;
      const payload: CreateDailyMealDto = {
        ...createDailyMealDto,
        ...macros,
        meal_type: normalizedMealType as any,
        logged_at: effectiveLoggedAt,
        quantity_kg: effectiveQuantity,
      };
      const dailyMeal = this.dailyMealsRepository.create({
        ...payload,
        ...(meal && { meal }),
        daily_log: dailyLog,
      });
      const saved = await this.dailyMealsRepository.save(dailyMeal);
      await this.dailyLogsService.recalculateDailyLogMacros(dailyLog.id);
      return saved;
    } else {
      throw new BadRequestException('Either serving or quantity_kg must be provided');
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

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: DailyMeal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.dailyMealsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { logged_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOneOwned(id: string, userId: string): Promise<DailyMeal | null> {
    return await this.dailyMealsRepository
      .findOne({ where: { id }, relations: { daily_log: { user: true } } })
      .then((dailyMeal) => {
        if (!dailyMeal || dailyMeal.daily_log?.user?.id !== userId) {
          throw new ForbiddenException('Access denied');
        }
        return dailyMeal;
      });
  }

  async updateOneOwned(
    id: string,
    updateDailyMealDto: UpdateDailyMealDto,
    userId: string,
  ): Promise<DailyMeal | null> {
    const dailyMeal = await this.findOneOwned(id, userId);
    if (!dailyMeal) {
      throw new ForbiddenException('Access denied');
    }
    await this.dailyMealsRepository.update(
      { id, daily_log: { user: { id: userId } } },
      updateDailyMealDto,
    );
    return await this.findOneOwned(id, userId);
  }

  async removeOwned(id: string, userId: string): Promise<DailyMeal | null> {
    if (!id || id === 'undefined') {
      throw new ForbiddenException('Access denied');
    }
    const dailyMeal = await this.findOneOwned(id, userId);
    if (!dailyMeal) {
      throw new ForbiddenException('Access denied');
    }
    await this.dailyMealsRepository.delete(id);
    return dailyMeal;
  }
}
