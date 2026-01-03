import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { CreateFitnessGoalDto } from 'src/fitness_goals/dto/create-fitness_goal.dto';
import { FitnessGoalsService } from 'src/fitness_goals/fitness_goals.service';
import { FitnessProfilesService } from 'src/fitness_profiles/fitness_profiles.service';
import { FitnessGoalType } from 'src/helpers/enums/fitness-goal-type.enum';
import { Meal } from 'src/meals/entities/meal.entity';
import { MealRecommendationRequestDto } from './dto/meal-recommendation-request.dto';
import {
  MealRecommendationResponseDto,
  RecommendedMealDto,
} from './dto/meal-recommendation-response.dto';

type RecommendedGoal = {
  goal_type: FitnessGoalType;
  target_kcal: number;
  target_protein_gr: number;
  target_fat_gr: number;
  target_carbs_gr: number;
  target_fiber_gr: number;
};

@Injectable()
export class RecommendationsService {
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private fitnessGoalsService: FitnessGoalsService,
    private fitnessProfilesService: FitnessProfilesService,
    @InjectRepository(Meal) private readonly mealsRepository: Repository<Meal>,
    private readonly configService: ConfigService,
  ) {
    this.ai = new GoogleGenAI({});
  }

  async getRecommendations(userId: string): Promise<RecommendedGoal> {
    const fitnessProfile = await this.fitnessProfilesService.findOneByUserId(userId);
    const fitnessGoals = await this.fitnessGoalsService.findByUserId(userId);
    if (!fitnessProfile || fitnessGoals.length === 0) {
      throw new NotFoundException('Fitness profile or goals not found for the user');
    }

    const fitnessGoal = fitnessGoals[0]; // latest goal (already sorted DESC)

    if (!fitnessProfile.tdee_kcal) {
      throw new NotFoundException('TDEE kcal not found in fitness profile');
    }

    const goalType: FitnessGoalType = fitnessGoal.goal_type;

    const target_kcal = this.calculateCalorieIntake(fitnessProfile.tdee_kcal, goalType);
    const macros = this.calculateMacronutrients(target_kcal, goalType);

    return {
      goal_type: goalType,
      target_kcal,
      target_protein_gr: macros.protein,
      target_fat_gr: macros.fat,
      target_carbs_gr: macros.carbs,
      target_fiber_gr: macros.fiber,
    };
  }

  async applyRecommendationsToFitnessGoal(userId: string, recommendedGoal: RecommendedGoal) {
    const dto: CreateFitnessGoalDto = {
      ...recommendedGoal,
      user_id: userId,
    };
    return await this.fitnessGoalsService.create(dto, userId);
  }

  private calculateCalorieIntake(baseKcal: number, goalType: FitnessGoalType): number {
    switch (goalType) {
      case FitnessGoalType.CUT:
        return baseKcal - 500; // reduce 500 kcal for weight loss
      case FitnessGoalType.BULK:
        return baseKcal + 500; // increase 500 kcal for muscle gain
      case FitnessGoalType.MAINTAIN:
        return baseKcal; // Maintain current intake
      case FitnessGoalType.RECOVERY:
        return baseKcal + 300; // increase 300 kcal for recovery
      case FitnessGoalType.GAIN_MUSCLES:
        return baseKcal + 400; // increase 400 kcal for muscle gain
      default:
        return baseKcal; // Maintain current intake
    }
  }

  private calculateMacronutrients(
    calorieIntake: number,
    goalType: FitnessGoalType,
  ): { protein: number; fat: number; carbs: number; fiber: number } {
    let proteinGr = 0;
    let fatGr = 0;
    let carbsGr = 0;
    let fiberGr = 0;
    switch (goalType) {
      case FitnessGoalType.CUT:
        proteinGr = (calorieIntake * 0.4) / 4;
        fatGr = (calorieIntake * 0.3) / 9;
        carbsGr = (calorieIntake * 0.3) / 4;
        fiberGr = 30;
        break;
      case FitnessGoalType.BULK:
        proteinGr = (calorieIntake * 0.3) / 4;
        fatGr = (calorieIntake * 0.25) / 9;
        carbsGr = (calorieIntake * 0.45) / 4;
        fiberGr = 25;
        break;
      case FitnessGoalType.MAINTAIN:
        proteinGr = (calorieIntake * 0.3) / 4;
        fatGr = (calorieIntake * 0.3) / 9;
        carbsGr = (calorieIntake * 0.4) / 4;
        fiberGr = 28;
        break;
      case FitnessGoalType.RECOVERY:
        proteinGr = (calorieIntake * 0.35) / 4;
        fatGr = (calorieIntake * 0.25) / 9;
        carbsGr = (calorieIntake * 0.4) / 4;
        fiberGr = 30;
        break;
      case FitnessGoalType.GAIN_MUSCLES:
        proteinGr = (calorieIntake * 0.3) / 4;
        fatGr = (calorieIntake * 0.2) / 9;
        carbsGr = (calorieIntake * 0.5) / 4;
        fiberGr = 25;
        break;
    }
    return {
      protein: Math.round(proteinGr),
      fat: Math.round(fatGr),
      carbs: Math.round(carbsGr),
      fiber: Math.round(fiberGr),
    };
  }

  async getMealRecommendations(
    userId: string,
    requestDto: MealRecommendationRequestDto,
  ): Promise<MealRecommendationResponseDto> {
    const fitnessProfile = await this.fitnessProfilesService.findOneByUserId(userId);
    const fitnessGoals = await this.fitnessGoalsService.findByUserId(userId);

    if (!fitnessProfile || fitnessGoals.length === 0) {
      throw new NotFoundException(
        'Fitness profile or goals not found. Please set up your profile first.',
      );
    }

    const fitnessGoal = fitnessGoals[0];
    const goalType = fitnessGoal.goal_type;
    const targetKcal = fitnessGoal.target_kcal || 2000;
    const targetProtein = fitnessGoal.target_protein_gr || 150;

    const meals = await this.searchMeals(requestDto);

    if (meals.length === 0) {
      return {
        recommended: [],
        warnings: [],
        encouragement:
          "I couldn't find meals matching your query. Try searching with different ingredients!",
        summary: 'No meals found in the database.',
      };
    }

    const prompt = this.buildMealRecommendationPrompt(
      requestDto,
      meals,
      goalType,
      targetKcal,
      targetProtein,
    );

    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });
      const aiResponse = result.text || '';

      return this.parseAiResponse(aiResponse, meals, goalType);
    } catch (error) {
      this.logger.error('Gemini API error:', error);
      return this.fallbackRecommendation(meals, goalType, targetKcal, targetProtein);
    }
  }

  private async searchMeals(requestDto: MealRecommendationRequestDto): Promise<Meal[]> {
    const { query, ingredients, mealType } = requestDto;
    const searchTerms = ingredients || this.extractIngredientsFromQuery(query);

    if (searchTerms.length === 0) {
      return await this.mealsRepository.find({
        where: { name: ILike(`%${query}%`) },
        take: 10,
        order: { rating: 'DESC' },
      });
    }

    const meals: Meal[] = [];
    for (const term of searchTerms) {
      const found = await this.mealsRepository.find({
        where: { name: ILike(`%${term}%`) },
        take: 5,
        order: { rating: 'DESC' },
      });
      meals.push(...found);
    }

    const uniqueMeals = Array.from(new Map(meals.map((m) => [m.id, m])).values());

    return uniqueMeals.slice(0, 10);
  }

  private extractIngredientsFromQuery(query: string): string[] {
    const commonIngredients = [
      'chicken',
      'beef',
      'pork',
      'fish',
      'salmon',
      'tuna',
      'shrimp',
      'egg',
      'rice',
      'pasta',
      'noodle',
      'bread',
      'potato',
      'broccoli',
      'carrot',
      'spinach',
      'tomato',
      'lettuce',
      'apple',
      'banana',
      'cheese',
      'milk',
      'yogurt',
      'tofu',
      'bean',
    ];

    const queryLower = query.toLowerCase();
    return commonIngredients.filter((ingredient) => queryLower.includes(ingredient));
  }

  private buildMealRecommendationPrompt(
    requestDto: MealRecommendationRequestDto,
    meals: Meal[],
    goalType: FitnessGoalType,
    targetKcal: number,
    targetProtein: number,
  ): string {
    const goalDescriptions = {
      [FitnessGoalType.CUT]: 'weight loss (high protein, calorie deficit)',
      [FitnessGoalType.BULK]: 'muscle gain (high calories, high carbs)',
      [FitnessGoalType.MAINTAIN]: 'weight maintenance (balanced nutrition)',
      [FitnessGoalType.RECOVERY]: 'recovery (moderate calories, high protein)',
      [FitnessGoalType.GAIN_MUSCLES]: 'lean muscle gain (moderate surplus, high protein)',
    };

    const mealsData = meals.map(
      (m) =>
        `- ${m.name}: ${m.kcal_per_100gr} kcal, ${m.protein_per_100gr}g protein, ${m.fat_per_100gr}g fat, ${m.carbs_per_100gr}g carbs (per 100g)`,
    );

    return `You are a supportive nutrition assistant helping someone with their fitness goals.

User's Goal: ${goalDescriptions[goalType]}
Daily Target: ${targetKcal} kcal, ${targetProtein}g protein
User Query: "${requestDto.query}"

Available meals in database:
${mealsData.join('\n')}

IMPORTANT PSYCHOLOGICAL SAFETY:
- Be encouraging and non-judgmental
- Avoid triggering eating disorder (ED) behaviors
- Emphasize balance and sustainability over perfection
- Remind that one meal doesn't define progress
- Never use guilt or shame

Please analyze each meal and respond in this EXACT JSON format (no extra text):
{
  "recommended": [
    {
      "mealName": "exact meal name from list",
      "score": 85,
      "badge": "✅ Great for weight loss",
      "reasoning": "High protein, low calories",
      "psychologicalNote": "Excellent choice! Remember progress is built over time."
    }
  ],
  "warnings": [
    {
      "mealName": "exact meal name from list",
      "score": 45,
      "badge": "⚠️ Higher in calories",
      "reasoning": "May exceed daily target",
      "psychologicalNote": "This can still fit into your plan with smaller portions or as an occasional treat."
    }
  ],
  "summary": "Based on your weight loss goal, focus on high-protein options",
  "encouragement": "You're doing great by making informed choices!"
}`;
  }

  private parseAiResponse(
    aiResponse: string,
    meals: Meal[],
    goalType: FitnessGoalType,
  ): MealRecommendationResponseDto {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const recommended: RecommendedMealDto[] = (parsed.recommended || [])
        .map(
          (item: {
            mealName: string;
            score?: number;
            badge?: string;
            reasoning?: string;
            psychologicalNote?: string;
          }) => {
            const meal = meals.find((m) => m.name === item.mealName);
            if (!meal) return null;
            return {
              meal,
              score: item.score || 0,
              badge: item.badge || '✅ Recommended',
              reasoning: item.reasoning || '',
              psychologicalNote: item.psychologicalNote,
            };
          },
        )
        .filter(Boolean);

      const warnings: RecommendedMealDto[] = (parsed.warnings || [])
        .map(
          (item: {
            mealName: string;
            score?: number;
            badge?: string;
            reasoning?: string;
            psychologicalNote?: string;
          }) => {
            const meal = meals.find((m) => m.name === item.mealName);
            if (!meal) return null;
            return {
              meal,
              score: item.score || 0,
              badge: item.badge || '⚠️ Be mindful',
              reasoning: item.reasoning || '',
              psychologicalNote: item.psychologicalNote,
            };
          },
        )
        .filter(Boolean);

      return {
        recommended,
        warnings,
        summary: parsed.summary || 'AI recommendations generated successfully.',
        encouragement:
          parsed.encouragement || "You're making great progress by planning your meals mindfully!",
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response:', error);
      return this.fallbackRecommendation(meals, goalType, 2000, 150);
    }
  }

  private fallbackRecommendation(
    meals: Meal[],
    goalType: FitnessGoalType,
    _targetKcal: number,
    _targetProtein: number,
  ): MealRecommendationResponseDto {
    const scoredMeals = meals.map((meal) => {
      let score = 50;

      const proteinPer100g = meal.protein_per_100gr || 0;
      const kcalPer100g = meal.kcal_per_100gr || 0;

      if (goalType === FitnessGoalType.CUT) {
        score += proteinPer100g > 20 ? 20 : proteinPer100g;
        score += kcalPer100g < 150 ? 15 : kcalPer100g < 250 ? 10 : 0;
      } else if (goalType === FitnessGoalType.BULK || goalType === FitnessGoalType.GAIN_MUSCLES) {
        score += proteinPer100g > 15 ? 20 : proteinPer100g;
        score += kcalPer100g > 200 ? 15 : 5;
      }

      return { meal, score: Math.min(score, 100) };
    });

    scoredMeals.sort((a, b) => b.score - a.score);

    const recommended = scoredMeals
      .filter((s) => s.score >= 60)
      .slice(0, 5)
      .map((s) => ({
        meal: s.meal,
        score: s.score,
        badge: s.score >= 80 ? '✅ Excellent choice' : '✅ Good option',
        reasoning: `Fits your ${goalType} goal`,
        psychologicalNote: 'Remember, progress is about consistency, not perfection!',
      }));

    const warnings = scoredMeals
      .filter((s) => s.score < 60)
      .slice(0, 3)
      .map((s) => ({
        meal: s.meal,
        score: s.score,
        badge: '⚠️ Be mindful',
        reasoning: 'May not align perfectly with your current goal',
        psychologicalNote: 'This can still fit with portion control or as an occasional choice!',
      }));

    return {
      recommended,
      warnings,
      summary: `Based on your ${goalType} goal, here are some options.`,
      encouragement: "Great job planning ahead! You're taking control of your nutrition.",
    };
  }
}
