import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateMealDto {
  @ApiProperty({ example: 'Chicken Salad', description: 'Name of the meal' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 100, description: 'Serving size in grams' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  serving_gr?: number;

  @ApiProperty({ example: 250, description: 'Calories per 100g' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'Calories must be positive' })
  kcal_per_100gr?: number; // cal later

  @ApiProperty({ example: 30, description: 'Protein per 100gr' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'Protein cannot be negative' })
  protein_per_100gr?: number;

  @ApiProperty({ example: 10, description: 'Fat per 100gr' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'Fat cannot be negative' })
  fat_per_100gr?: number;

  @ApiProperty({ example: 40, description: 'Carbohydrates per 100gr' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'Carbs cannot be negative' })
  carbs_per_100gr?: number;

  @ApiProperty({ example: 5, description: 'Fiber per 100gr' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'Fiber cannot be negative' })
  fiber_per_100gr?: number;

  @ApiProperty({ example: 4.5, description: 'Rating of the meal' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  rating?: number;

  @ApiProperty({ example: [FoodType.MEAT], description: 'Tags for the meal' })
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
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  is_verified?: boolean;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL of the meal' })
  @IsOptional()
  @IsUrl()
  image_url?: string | null;

  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  deleted_at?: Date | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  made_from_ingredients?: boolean;
}
