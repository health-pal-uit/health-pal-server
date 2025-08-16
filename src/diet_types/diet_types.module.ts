import { Module } from '@nestjs/common';
import { DietTypesService } from './diet_types.service';
import { DietTypesController } from './diet_types.controller';

@Module({
  controllers: [DietTypesController],
  providers: [DietTypesService],
})
export class DietTypesModule {}
