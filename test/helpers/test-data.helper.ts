import { CreateFitnessProfileDto } from 'src/fitness_profiles/dto/create-fitness_profile.dto';
import { CreateFitnessGoalDto } from 'src/fitness_goals/dto/create-fitness_goal.dto';
import { CreateDailyMealDto } from 'src/daily_meals/dto/create-daily_meal.dto';

export class TestDataHelper {
  /**
   * Generate valid fitness profile data
   */
  static validFitnessProfile(userId: string, dietTypeId: string): Partial<CreateFitnessProfileDto> {
    return {
      user_id: userId,
      weight_kg: 70,
      height_m: 1.75,
      activity_level: 'moderately' as any, // Fixed: use correct enum value
      diet_type_id: dietTypeId,
      waist_cm: 80,
      neck_cm: 35,
      hip_cm: 95,
    };
  }

  /**
   * Generate valid fitness goal data
   */
  static validFitnessGoal(userId: string): Partial<CreateFitnessGoalDto> {
    return {
      user_id: userId,
      goal_type: 'cut' as any, // Fixed: use correct enum value
      target_kcal: 2000,
      target_protein_gr: 150,
      target_fat_gr: 65,
      target_carbs_gr: 200,
      target_fiber_gr: 25,
    };
  }

  /**
   * Generate valid daily meal data
   */
  static validDailyMeal(userId: string, mealId: string): Partial<CreateDailyMealDto> {
    return {
      meal_id: mealId,
      meal_type: 'breakfast' as any, // Fixed: use lowercase enum value
    };
  }

  /**
   * Generate invalid data for failure tests
   */
  static invalidFitnessProfile(userId: string): any {
    return {
      user_id: userId,
      weight_kg: -70, // Invalid: negative weight
      height_m: -1.75, // Invalid: negative height
      activity_level: 'SUPER_ACTIVE', // Invalid: not in enum
    };
  }
}
