import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { ContributionIngresModule } from 'src/contribution_ingres/contribution_ingres.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient]), ContributionIngresModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
