import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFitnessGoalDto } from 'src/fitness_goals/dto/create-fitness_goal.dto';
import { FitnessGoalsService } from 'src/fitness_goals/fitness_goals.service';
import { FitnessProfilesService } from 'src/fitness_profiles/fitness_profiles.service';
import { FitnessGoalType } from 'src/helpers/enums/fitness-goal-type.enum';

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
  constructor(
    private fitnessGoalsService: FitnessGoalsService,
    private fitnessProfilesService: FitnessProfilesService,
  ) {}

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
}
