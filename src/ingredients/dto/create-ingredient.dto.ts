import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { FoodType } from 'src/helpers/enums/food-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Chicken Breast', description: 'Name of the ingredient' })
  @IsString()
  @IsNotEmpty()
  name!: string; // *doesnt need to be unique

  @ApiProperty({ example: 165, description: 'Calories per 100g' })
  @IsNotEmpty()
  @IsPositive()
  kcal_per_100g!: number; // must be >= 0

  @ApiProperty({ example: 31, description: 'Protein per 100g' })
  @IsOptional()
  @IsPositive()
  protein_per_100g?: number; // calculate later

  @ApiProperty({ example: 5, description: 'Fat per 100g' })
  @IsOptional()
  @IsPositive()
  fat_per_100g?: number;

  @ApiProperty({ example: 0, description: 'Carbohydrates per 100g' })
  @IsOptional()
  @IsPositive()
  carbs_per_100g?: number;

  @ApiProperty({ example: 0, description: 'Fiber per 100g' })
  @IsOptional()
  @IsPositive()
  fiber_per_100g?: number;

  @ApiProperty({
    example: 'Notes about the ingredient',
    description: 'Additional notes about the ingredient',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: [FoodType.MEAT], description: 'Tags for the ingredient' })
  @IsNotEmpty({ each: true })
  @IsEnum(FoodType, { each: true })
  tags!: FoodType[];

  @ApiProperty({ example: true, description: 'Indicates if the ingredient is verified' })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Image URL of the ingredient',
  })
  @IsUrl()
  @IsOptional()
  image_url?: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the ingredient' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;
}
