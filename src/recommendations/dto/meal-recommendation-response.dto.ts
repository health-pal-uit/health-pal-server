import { ApiProperty } from '@nestjs/swagger';
import { Meal } from 'src/meals/entities/meal.entity';

export class RecommendedMealDto {
  @ApiProperty({ description: 'The meal entity' })
  meal!: Meal;

  @ApiProperty({
    example: 95,
    description: 'Compatibility score (0-100) based on user goals',
  })
  score!: number;

  @ApiProperty({
    example: '✅ Perfect for weight loss',
    description: 'Badge indicating suitability',
  })
  badge!: string;

  @ApiProperty({
    example: 'High protein, low calories. Supports your goal!',
    description: 'Reasoning for recommendation',
  })
  reasoning!: string;

  @ApiProperty({
    example: 'Great choice! Remember, one meal does not define your progress.',
    description: 'Psychological encouragement to prevent ED triggers',
    required: false,
  })
  psychologicalNote?: string;
}

export class MealRecommendationResponseDto {
  @ApiProperty({
    type: [RecommendedMealDto],
    description: 'Recommended meals that fit user goals',
  })
  recommended!: RecommendedMealDto[];

  @ApiProperty({
    type: [RecommendedMealDto],
    description: 'Meals with warnings (less suitable)',
  })
  warnings!: RecommendedMealDto[];

  @ApiProperty({
    example: 'You are doing great! These meals will help you reach your goals.',
    description: 'General encouragement message',
  })
  encouragement!: string;

  @ApiProperty({
    example: 'Based on your CUT goal, I recommend high-protein, moderate-carb meals.',
    description: 'AI-generated summary of recommendations',
  })
  summary!: string;
}
