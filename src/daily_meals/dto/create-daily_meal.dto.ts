import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { MealType } from 'src/helpers/enums/meal-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';
import { Check } from 'typeorm';
// isdefined = string passes // whereas notempty = not null and not undefined and not ''

@Check(
  `total_kcal >= 0 AND total_protein_gr >= 0 AND total_fat_gr >= 0 AND total_carbs_gr >= 0 AND total_fiber_gr >= 0`,
)
@Check(`(quantity_kg IS NOT NULL AND quantity_kg > 0) OR (serving IS NOT NULL AND serving > 0)`)
export class CreateDailyMealDto {
  @ApiProperty({ example: 1, description: 'Quantity in kg' })
  @IsOptional()
  @IsNumber()
  quantity_kg?: number;

  @ApiProperty({ example: 1, description: 'Serving size' })
  @IsOptional()
  @IsNumber()
  serving?: number;

  @ApiProperty({ example: 250, description: 'Total calories' })
  @IsOptional()
  @IsNumber()
  total_kcal?: number;

  @ApiProperty({ example: 30, description: 'Total protein in grams' })
  @IsOptional()
  @IsNumber()
  total_protein_gr?: number;

  @ApiProperty({ example: 10, description: 'Total fat in grams' })
  @IsOptional()
  @IsNumber()
  total_fat_gr?: number;

  @ApiProperty({ example: 100, description: 'Total carbohydrates in grams' })
  @IsOptional()
  @IsNumber()
  total_carbs_gr?: number;

  @ApiProperty({ example: 5, description: 'Total fiber in grams' })
  @IsOptional()
  @IsNumber()
  total_fiber_gr?: number;

  @ApiProperty({ example: 'breakfast', description: 'Meal type', enum: MealType })
  @IsNotEmpty()
  @IsEnum(MealType)
  meal_type!: MealType;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Logged at' })
  @IsNotEmpty()
  @IsDateString()
  @TransformToISODate()
  logged_at!: Date;

  // relations => 2

  @ApiProperty({ example: 'uuid-of-meal', description: 'Meal ID' })
  @IsNotEmpty()
  @IsUUID('4')
  meal_id!: string;

  @ApiProperty({ example: 'uuid-of-daily-log', description: 'Daily Log ID' })
  @IsNotEmpty()
  @IsUUID('4')
  daily_log_id!: string;
}
