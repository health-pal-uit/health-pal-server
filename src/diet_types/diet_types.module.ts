import { Module } from '@nestjs/common';
import { DietTypesService } from './diet_types.service';
import { DietTypesController } from './diet_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietType } from './entities/diet_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DietType])],
  controllers: [DietTypesController],
  providers: [DietTypesService],
})
export class DietTypesModule {}
