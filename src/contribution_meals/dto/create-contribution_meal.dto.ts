import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { FoodType } from 'src/helpers/enums/food-type.enum';

export class CreateContributionMealDto {
  @ApiProperty({ example: 'Chicken Breast', description: 'Name of the item' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 100, required: false, description: 'Serving size in grams' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  serving_gr?: number | null;

  @ApiProperty({ example: 165, description: 'Calories per 100g' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  kcal_per_100gr?: number;

  @ApiProperty({ example: 31, required: false, description: 'Protein per 100g' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  protein_per_100gr?: number;

  @ApiProperty({ example: 5, required: false, description: 'Fat per 100g' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fat_per_100gr?: number;

  @ApiProperty({ example: 0, required: false, description: 'Carbs per 100g' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbs_per_100gr?: number;

  @ApiProperty({ example: 0, required: false, description: 'Fiber per 100g' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fiber_per_100gr?: number;

  @ApiProperty({ example: 'Extra lean; remove skin before cooking', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: [FoodType.MEAT], required: false, isArray: true, enum: FoodType })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    // Handle both string and array inputs from multipart form data
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  @IsEnum(FoodType, { each: true })
  tags?: FoodType[];

  @ApiProperty({ example: 'https://cdn.example.com/food/chicken-breast.jpg', required: false })
  @IsOptional()
  @IsUrl()
  image_url?: string | null;

  @ApiProperty({ example: [], required: false, description: 'Ingredient data as JSON' })
  @IsOptional()
  ingredients_data?: any; // Store the ingredients payload temporarily
}
