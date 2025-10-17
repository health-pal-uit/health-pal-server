import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDailyIngreDto } from './dto/create-daily_ingre.dto';
import { UpdateDailyIngreDto } from './dto/update-daily_ingre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyIngre } from './entities/daily_ingre.entity';
import { DeleteResult, Repository } from 'typeorm';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Macros } from 'src/helpers/types/macro.type';
import { DailyLogsService } from 'src/daily_logs/daily_logs.service';

@Injectable()
export class DailyIngresService {
  constructor(
    @InjectRepository(DailyIngre) private dailyIngreRepository: Repository<DailyIngre>,
    @InjectRepository(DailyLog) private dailyLogRepository: Repository<DailyLog>,
    @InjectRepository(Ingredient) private ingredientRepository: Repository<Ingredient>,
    private dailyLogsService: DailyLogsService,
  ) {}

  async findAllByUser(userId: string) {
    return await this.dailyIngreRepository.find({ where: { daily_log: { user: { id: userId } } } });
  }
  // will implement create many daily ingredients at once later

  async createMany(
    createDailyIngreDtos: CreateDailyIngreDto[],
    userId: string,
  ): Promise<DailyIngre[]> {
    const dailyIngreList: DailyIngre[] = [];
    for (const dto of createDailyIngreDtos) {
      const dailyIngre = await this.create(dto, userId);
      dailyIngreList.push(dailyIngre);
    }
    return dailyIngreList;
  }

  async create(createDailyIngreDto: CreateDailyIngreDto, userId: string): Promise<DailyIngre> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id: createDailyIngreDto.ingredient_id },
    });
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(
      userId,
      createDailyIngreDto.logged_at ?? new Date(),
    );
    if (!ingredient) {
      throw new Error('Ingredient not found');
    }
    if (!dailyLog) {
      throw new Error('Daily log not found');
    }
    const scale = createDailyIngreDto.quantity_kg * 10; // kg -> 100gr

    const macros = {
      total_kcal: ingredient.kcal_per_100gr * scale,
      total_protein_gr: ingredient.protein_per_100gr * scale,
      total_fat_gr: ingredient.fat_per_100gr * scale,
      total_carbs_gr: ingredient.carbs_per_100gr * scale,
      total_fiber_gr: ingredient.fiber_per_100gr * scale,
    } satisfies Pick<
      CreateDailyIngreDto,
      'total_kcal' | 'total_protein_gr' | 'total_fat_gr' | 'total_carbs_gr' | 'total_fiber_gr'
    >;
    const payload: CreateDailyIngreDto = {
      ...createDailyIngreDto,
      ...macros,
      logged_at: createDailyIngreDto.logged_at ?? new Date(),
    };
    const dailyIngre = this.dailyIngreRepository.create({
      ...payload,
      ingredient,
      daily_log: dailyLog,
    });
    const saved = await this.dailyIngreRepository.save(dailyIngre);
    await this.dailyLogsService.recalculateDailyLogMacros(dailyLog.id);
    return saved;
  }

  async findAll(): Promise<DailyIngre[]> {
    return await this.dailyIngreRepository.find();
  }

  async findOneOwned(id: string, userId: string): Promise<DailyIngre | null> {
    return await this.dailyIngreRepository
      .findOne({ where: { id }, relations: { daily_log: true } })
      .then((dailyIngre) => {
        if (dailyIngre?.daily_log.user.id !== userId) {
          throw new ForbiddenException('Access denied');
        }
        return dailyIngre;
      });
  }

  async updateOneOwned(id: string, updateDailyIngreDto: UpdateDailyIngreDto, userId: string) {
    const dailyIngre = await this.findOneOwned(id, userId);
    if (!dailyIngre) {
      throw new ForbiddenException('Access denied');
    }
    return await this.dailyIngreRepository.update(
      { id, daily_log: { user: { id: userId } } },
      updateDailyIngreDto,
    );
  }

  async removeOwned(id: string, userId: string): Promise<DeleteResult> {
    const dailyIngre = await this.findOneOwned(id, userId);
    if (!dailyIngre) {
      throw new ForbiddenException('Access denied');
    }
    return await this.dailyIngreRepository.delete({ id, daily_log: { user: { id: userId } } });
  }
}
