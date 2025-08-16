import { Module } from '@nestjs/common';
import { DailyIngresService } from './daily_ingres.service';
import { DailyIngresController } from './daily_ingres.controller';

@Module({
  controllers: [DailyIngresController],
  providers: [DailyIngresService],
})
export class DailyIngresModule {}
