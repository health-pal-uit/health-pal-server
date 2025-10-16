import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { FoodType } from 'src/helpers/enums/food-type.enum';

export class CreateContributionIngreDto {
  @ApiProperty({ example: 'Chicken Breast', description: 'Name of the item' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 165, description: 'Calories per 100g' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  kcal_per_100gr!: number;

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
  @IsEnum(FoodType, { each: true })
  tags?: FoodType[];

  @ApiProperty({ example: 'https://cdn.example.com/food/chicken-breast.jpg', required: false })
  @IsOptional()
  @IsUrl()
  image_url?: string | null;
}
