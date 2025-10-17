import { Module } from '@nestjs/common';
import { DailyIngresService } from './daily_ingres.service';
import { DailyIngresController } from './daily_ingres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyIngre } from './entities/daily_ingre.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { DailyLogsModule } from 'src/daily_logs/daily_logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyIngre, DailyLog, Ingredient]), DailyLogsModule],
  controllers: [DailyIngresController],
  providers: [DailyIngresService],
})
export class DailyIngresModule {}
