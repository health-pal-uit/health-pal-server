import { Injectable } from '@nestjs/common';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import { ContributionMealsService } from 'src/contribution_meals/contribution_meals.service';
import { IngredientPayload } from './dto/ingredient-payload.type';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { calculateMacros } from 'src/helpers/functions/macro-calculator';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal) private mealsRepository: Repository<Meal>,
    @InjectRepository(IngreMeal) private ingreMealsRepository: Repository<IngreMeal>,
    @InjectRepository(Ingredient) private ingredientsRepository: Repository<Ingredient>,
  ) {}

  async updateFromIngredients(
    id: string,
    ingredients: IngredientPayload[],
  ): Promise<Meal | UpdateResult | null> {
    const existingMeal = await this.mealsRepository.findOne({
      where: { id },
      relations: ['ingre_meals'],
    });
    if (!existingMeal) {
      throw new Error('Meal not found');
    }
    // delete existing ingre_meals
    await this.ingreMealsRepository.delete({ meal: { id: existingMeal.id } });
    // create new ingre_meals
    const ingreMeals = ingredients.map((item) => {
      const ingredient = this.ingredientsRepository.create({
        id: item.ingredient_id,
      } as Ingredient);
      if (!ingredient) {
        throw new Error(`Ingredient with id ${item.ingredient_id} not found`);
      }
      return this.ingreMealsRepository.create({
        meal: existingMeal,
        ingredient: ingredient,
        quantity_kg: item.quantity_kg,
      });
    });
    await this.ingreMealsRepository.save(ingreMeals);
    const mealWithIngredients = await this.mealsRepository.findOne({
      where: { id: existingMeal.id },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
    const portions = mealWithIngredients!.ingre_meals.map((im) => {
      return {
        quantity_kg: im.quantity_kg,
        per100: {
          kcal: im.ingredient.kcal_per_100gr ?? 0,
          protein: im.ingredient.protein_per_100gr ?? 0,
          fat: im.ingredient.fat_per_100gr ?? 0,
          carbs: im.ingredient.carbs_per_100gr ?? 0,
          fiber: im.ingredient.fiber_per_100gr ?? 0,
        },
      };
    });
    const { per100g, totalWeightG } = calculateMacros(portions);
    await this.mealsRepository.update(existingMeal.id, {
      kcal_per_100gr: per100g.kcal,
      protein_per_100gr: per100g.protein,
      fat_per_100gr: per100g.fat,
      carbs_per_100gr: per100g.carbs,
      fiber_per_100gr: per100g.fiber,
      serving_gr: totalWeightG,
    });
    return await this.mealsRepository.findOne({
      where: { id: existingMeal.id },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
  }

  async createFromIngredients(
    meal: CreateMealDto,
    items: IngredientPayload[],
  ): Promise<Meal | null> {
    const createdMeal = await this.create({ ...meal, is_verified: true }); // create meal first
    const savedMeal = await this.mealsRepository.save(createdMeal);
    const ingreMeals = items.map((item) => {
      const ingredient = this.ingredientsRepository.create({
        id: item.ingredient_id,
      } as Ingredient);
      if (!ingredient) {
        throw new Error(`Ingredient with id ${item.ingredient_id} not found`);
      }
      return this.ingreMealsRepository.create({
        meal: savedMeal,
        ingredient: ingredient,
        quantity_kg: item.quantity_kg,
      });
    });
    await this.ingreMealsRepository.save(ingreMeals);
    const mealWithIngredients = await this.mealsRepository.findOne({
      where: { id: savedMeal.id },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
    const portions = mealWithIngredients!.ingre_meals.map((im) => {
      return {
        quantity_kg: im.quantity_kg,
        per100: {
          kcal: im.ingredient.kcal_per_100gr ?? 0,
          protein: im.ingredient.protein_per_100gr ?? 0,
          fat: im.ingredient.fat_per_100gr ?? 0,
          carbs: im.ingredient.carbs_per_100gr ?? 0,
          fiber: im.ingredient.fiber_per_100gr ?? 0,
        },
      };
    });
    const { per100g, totalWeightG } = calculateMacros(portions);
    await this.mealsRepository.update(savedMeal.id, {
      kcal_per_100gr: per100g.kcal,
      protein_per_100gr: per100g.protein,
      fat_per_100gr: per100g.fat,
      carbs_per_100gr: per100g.carbs,
      fiber_per_100gr: per100g.fiber,
      serving_gr: totalWeightG,
    });
    return await this.mealsRepository.findOne({
      where: { id: savedMeal.id },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
  }

  async create(createMealDto: CreateMealDto): Promise<Meal> {
    const meal = this.mealsRepository.create(createMealDto);
    return await this.mealsRepository.save(meal);
  }

  async findAll(): Promise<Meal[]> {
    return await this.mealsRepository.find({
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
      where: { deleted_at: IsNull() },
    });
  }

  // only verified meals for user
  async findAllUser(): Promise<Meal[]> {
    return await this.mealsRepository.find({
      where: { is_verified: true, deleted_at: IsNull() },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
  }
  async findOne(id: string): Promise<Meal | null> {
    return await this.mealsRepository.findOne({
      where: { id },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
  }

  async update(id: string, updateMealDto: UpdateMealDto): Promise<UpdateResult> {
    return await this.mealsRepository.update(id, updateMealDto);
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.mealsRepository.softDelete(id);
  }
}
