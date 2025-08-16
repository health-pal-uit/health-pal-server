import { Module } from '@nestjs/common';
import { MedalsService } from './medals.service';
import { MedalsController } from './medals.controller';

@Module({
  controllers: [MedalsController],
  providers: [MedalsService],
})
export class MedalsModule {}
