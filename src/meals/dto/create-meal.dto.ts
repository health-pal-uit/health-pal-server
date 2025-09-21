import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { FoodType } from 'src/helpers/enums/food-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateMealDto {
  @ApiProperty({ example: 'Chicken Salad', description: 'Name of the meal' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 250, description: 'Calories per 100g' })
  @IsOptional()
  @IsNumber()
  kcal_per_100g?: number; // cal later

  @ApiProperty({ example: 30, description: 'Protein per 100g' })
  @IsOptional()
  @IsNumber()
  protein_per_100g?: number;

  @ApiProperty({ example: 10, description: 'Fat per 100g' })
  @IsOptional()
  @IsNumber()
  fat_per_100g?: number;

  @ApiProperty({ example: 40, description: 'Carbohydrates per 100g' })
  @IsOptional()
  @IsNumber()
  carbs_per_100g?: number;

  @ApiProperty({ example: 5, description: 'Fiber per 100g' })
  @IsOptional()
  @IsNumber()
  fiber_per_100g?: number;

  @ApiProperty({ example: 4.5, description: 'Rating of the meal' })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ example: [FoodType.MEAT], description: 'Tags for the meal' })
  @IsEnum(FoodType, { each: true })
  @IsOptional()
  tags?: FoodType[];

  @ApiProperty({ example: 'Notes about the meal', description: 'Additional notes about the meal' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date of the meal' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  @ApiProperty({ example: true, description: 'Indicates if the meal is verified' })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL of the meal' })
  @IsOptional()
  @IsUrl()
  image_url?: string | null;
}
