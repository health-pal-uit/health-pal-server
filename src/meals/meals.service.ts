import { Injectable } from '@nestjs/common';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { ILike, In, IsNull, Repository, UpdateResult } from 'typeorm';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import { IngredientPayload } from './dto/ingredient-payload.type';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { calculateMacros } from 'src/helpers/functions/macro-calculator';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';
import { isUUID } from 'class-validator';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal) private mealsRepository: Repository<Meal>,
    @InjectRepository(IngreMeal) private ingreMealsRepository: Repository<IngreMeal>,
    @InjectRepository(Ingredient) private ingredientsRepository: Repository<Ingredient>,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
  ) {}

  async searchByName(
    name: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Meal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.mealsRepository.findAndCount({
      where: {
        name: ILike(`%${name}%`),
        is_verified: true,
        deleted_at: IsNull(),
      },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

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
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Meal | null> {
    if (imageBuffer && imageName) {
      const bucketName = this.configService.get<string>('MEAL_IMG_BUCKET_NAME') || 'meal-imgs';
      const imagePath = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      meal.image_url = imagePath;
    }
    const createdMeal = await this.create({ ...meal, is_verified: true }); // create meal first
    const savedMeal = await this.mealsRepository.save(createdMeal);

    // Fetch all ingredients first to validate they exist
    const ingredientIds = items.map((item) => item.ingredient_id);
    const ingredients = await this.ingredientsRepository.find({
      where: { id: In(ingredientIds) },
    });
    if (ingredients.length !== ingredientIds.length) {
      throw new Error('One or more ingredients not found');
    }

    const ingreMeals = items.map((item) => {
      const ingredient = ingredients.find((i) => i.id === item.ingredient_id);
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

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Meal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.mealsRepository.findAndCount({
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
      where: { deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  // only verified meals for user
  async findAllUser(
    page = 1,
    limit = 10,
  ): Promise<{ data: Meal[]; total: number; page: number; limit: number }> {
    const safePage = page && page > 0 ? page : 1;
    const [data, total] = await this.mealsRepository.findAndCount({
      where: { is_verified: true, deleted_at: IsNull() },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
      skip: (safePage - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page: safePage, limit };
  }
  async findOne(id: string): Promise<Meal | null> {
    if (!isUUID(id)) {
      return null;
    }
    return await this.mealsRepository.findOne({
      where: { id },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
  }

  async findOneUser(id: string): Promise<Meal | null> {
    if (!isUUID(id)) {
      return null;
    }
    return await this.mealsRepository.findOne({
      where: { id, is_verified: true, deleted_at: IsNull() },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
  }

  async update(id: string, updateMealDto: UpdateMealDto): Promise<Meal | null> {
    await this.mealsRepository.update(id, updateMealDto);
    // Return with all fields and relations
    return await this.mealsRepository.findOne({
      where: { id },
      relations: ['ingre_meals', 'ingre_meals.ingredient'],
    });
  }

  async remove(id: string): Promise<Meal | null> {
    await this.mealsRepository.softDelete(id);
    // Query builder to get soft-deleted entity with all fields
    const deleted = await this.mealsRepository
      .createQueryBuilder('meal')
      .leftJoinAndSelect('meal.ingre_meals', 'ingre_meals')
      .leftJoinAndSelect('ingre_meals.ingredient', 'ingredient')
      .where('meal.id = :id', { id })
      .withDeleted()
      .getOne();
    return deleted;
  }
}
