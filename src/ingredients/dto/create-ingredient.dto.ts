import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
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
  @IsNumber()
  @Min(0)
  kcal_per_100gr!: number; // must be >= 0

  @ApiProperty({ example: 31, description: 'Protein per 100gr' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein_per_100gr?: number; // calculate later

  @ApiProperty({ example: 5, description: 'Fat per 100gr' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fat_per_100gr?: number;

  @ApiProperty({ example: 0, description: 'Carbohydrates per 100gr' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs_per_100gr?: number;

  @ApiProperty({ example: 0, description: 'Fiber per 100gr' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber_per_100gr?: number;

  @ApiProperty({
    example: 'Notes about the ingredient',
    description: 'Additional notes about the ingredient',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: [FoodType.MEAT], description: 'Tags for the ingredient' })
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
