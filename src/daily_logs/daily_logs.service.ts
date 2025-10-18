import { Injectable } from '@nestjs/common';
import { CreateDailyLogDto } from './dto/create-daily_log.dto';
import { UpdateDailyLogDto } from './dto/update-daily_log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyLog } from './entities/daily_log.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class DailyLogsService {
  constructor(@InjectRepository(DailyLog) private dailyLogRepository: Repository<DailyLog>) {}

  async findAllByUser(id: any) {
    return await this.dailyLogRepository.find({ where: { user: { id } } });
  }

  async findAll() {
    return await this.dailyLogRepository.find();
  }

  async findOne(id: string) {
    return await this.dailyLogRepository.findOne({
      where: { id },
      relations: { user: true, daily_ingres: true, daily_meals: true, activity_records: true },
    });
  }

  async update(id: string, updateDailyLogDto: UpdateDailyLogDto) {
    await this.dailyLogRepository.update(id, updateDailyLogDto);
    return this.dailyLogRepository.findOne({ where: { id } });
  }

  async getOrCreateDailyLog(userId: string, dateISO: Date | string): Promise<DailyLog | null> {
    // let dailyLog = await this.dailyLogRepository.findOne({ where: { user: { id: userId }, date: Equal(dateISO) } });
    // if (!dailyLog) {
    //   const newDailyLog = this.dailyLogRepository.create({ user: { id: userId }, date: dateISO });
    //   dailyLog = await this.dailyLogRepository.save(newDailyLog);
    // }
    // return await this.dailyLogRepository.findOne({ where: { id: dailyLog.id }, relations: { user: true, daily_ingres: true, daily_meals: true } });

    // convert to iso string if date or if string then slice to date only
    const isoDateString =
      typeof dateISO === 'string' ? dateISO.slice(0, 10) : dateISO.toISOString().slice(0, 10);
    const date = new Date(isoDateString);
    await this.dailyLogRepository.upsert({ user: { id: userId } as any, date }, ['user', 'date']);
    return this.dailyLogRepository.findOne({
      where: { user: { id: userId }, date },
      relations: { user: true, daily_ingres: true, daily_meals: true },
    });
  }

  // add burn kcal later (from activity records)
  async recalculateDailyLogMacros(dailyLogId: string): Promise<void> {
    const dailyLog = await this.dailyLogRepository.findOne({
      where: { id: dailyLogId },
      relations: { daily_ingres: true, daily_meals: true },
    });
    if (!dailyLog) {
      throw new Error('Daily log not found');
    }
    let total_kcal = 0;
    let total_protein_gr = 0;
    let total_fat_gr = 0;
    let total_carbs_gr = 0;
    let total_fiber_gr = 0;

    for (const ingre of dailyLog.daily_ingres) {
      total_kcal += ingre.total_kcal;
      total_protein_gr += ingre.total_protein_gr;
      total_fat_gr += ingre.total_fat_gr;
      total_carbs_gr += ingre.total_carbs_gr;
      total_fiber_gr += ingre.total_fiber_gr;
    }

    for (const meal of dailyLog.daily_meals) {
      total_kcal += meal.total_kcal;
      total_protein_gr += meal.total_protein_gr;
      total_fat_gr += meal.total_fat_gr;
      total_carbs_gr += meal.total_carbs_gr;
      total_fiber_gr += meal.total_fiber_gr;
    }

    dailyLog.total_kcal = total_kcal;
    dailyLog.total_protein_gr = total_protein_gr;
    dailyLog.total_fat_gr = total_fat_gr;
    dailyLog.total_carbs_gr = total_carbs_gr;
    dailyLog.total_fiber_gr = total_fiber_gr;

    await this.dailyLogRepository.save(dailyLog);
  }
}
