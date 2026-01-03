import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { MealType } from 'src/helpers/enums/meal-type.enum';

export class MealRecommendationRequestDto {
  @ApiProperty({
    example: 'What should I eat for dinner? I have chicken and rice',
    description: 'Natural language query for meal recommendations',
  })
  @IsString()
  query!: string;

  @ApiProperty({
    example: ['chicken', 'rice', 'broccoli'],
    description: 'Optional list of available ingredients',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({
    example: 'dinner',
    description: 'Optional meal type filter',
    enum: MealType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}
