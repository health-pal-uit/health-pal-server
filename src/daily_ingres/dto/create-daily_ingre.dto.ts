import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { MealType } from 'src/helpers/enums/meal-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateDailyIngreDto {
  @ApiProperty({ example: 1, description: 'Quantity in kg' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsNotEmpty()
  quantity_kg!: number;

  @ApiProperty({ example: 250, description: 'Total calories' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  total_kcal?: number;

  @ApiProperty({ example: 30, description: 'Total protein in grams' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  total_protein_gr?: number;

  @ApiProperty({ example: 10, description: 'Total fat in grams' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  total_fat_gr?: number;

  @ApiProperty({ example: 100, description: 'Total carbohydrates in grams' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  total_carbs_gr?: number;

  @ApiProperty({ example: 5, description: 'Total fiber in grams' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  total_fiber_gr?: number;

  @ApiProperty({ example: 'breakfast', description: 'Meal type', enum: MealType })
  @IsEnum(MealType)
  @IsNotEmpty()
  meal_type!: MealType;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Logged at' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  logged_at?: Date;

  // relations => 2

  @ApiProperty({ example: 'uuid-of-ingredient', description: 'Ingredient ID' })
  @IsNotEmpty()
  @IsUUID('4')
  ingredient_id!: string;

  @ApiProperty({ example: 'uuid-of-daily-log', description: 'Daily Log ID' })
  @IsOptional()
  @IsUUID('4')
  daily_log_id?: string;
}
