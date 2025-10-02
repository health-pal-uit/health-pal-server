import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { FoodType } from 'src/helpers/enums/food-type.enum';
import { ContributionType } from 'src/helpers/enums/contribution-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateContributionDto {
  @ApiProperty({
    enum: ContributionType,
    example: ContributionType.INGREDIENT,
    description: 'Contribution type: ingredient or meal',
  })
  @IsEnum(ContributionType)
  type!: ContributionType;

  @ApiProperty({
    example: 'f1e0d4f2-9f78-4b2c-8f2a-7a0d1b5c1234',
    required: false,
    description:
      'Target catalog row when editing an existing item (ingredient/mealc); omit for NEW',
  })
  @IsOptional()
  @IsUUID('4')
  target_id?: string;

  @ApiProperty({ example: 'Chicken Breast', description: 'Name of the item' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 165, description: 'Calories per 100g' })
  @IsNumber()
  @Min(0)
  kcal_per_100gr!: number;

  @ApiProperty({ example: 31, required: false, description: 'Protein per 100g' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein_per_100gr?: number;

  @ApiProperty({ example: 5, required: false, description: 'Fat per 100g' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fat_per_100gr?: number;

  @ApiProperty({ example: 0, required: false, description: 'Carbs per 100g' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs_per_100gr?: number;

  @ApiProperty({ example: 0, required: false, description: 'Fiber per 100g' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber_per_100gr?: number;

  @ApiProperty({
    example: 'Extra lean; remove skin before cooking',
    required: false,
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: [FoodType.MEAT],
    description: 'Tags for the item',
    isArray: true,
    enum: FoodType,
  })
  @IsNotEmpty({ each: true })
  @IsEnum(FoodType, { each: true })
  tags!: FoodType[];

  @ApiProperty({
    example: 'https://cdn.example.com/food/chicken-breast.jpg',
    required: false,
    description: 'Image URL',
  })
  @IsOptional()
  @IsUrl()
  image_url?: string | null;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    required: false,
    description: 'Creation date (usually set by server)',
  })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;
}
