import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { IngredientsService } from 'src/ingredients/ingredients.service';
import { MealsService } from 'src/meals/meals.service';
import { ContributionMealsService } from 'src/contribution_meals/contribution_meals.service';
import { ContributionIngresService } from 'src/contribution_ingres/contribution_ingres.service';

@Injectable()
export class FoodVisionService {
  private readonly logger = new Logger(FoodVisionService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly mealsService: MealsService,
    private readonly ingredientsService: IngredientsService,
    private readonly contributionMealsService: ContributionMealsService,
    private readonly contributionIngresService: ContributionIngresService,
  ) {
    this.food_url = this.config.get<string>('FOOD_VISION_URL')!;
  }
  food_url: string;

  async analyzeFoodImage(image: Express.Multer.File) {
    const formData = new FormData();
    formData.append('file', image.buffer, {
      filename: image.originalname,
      contentType: image.mimetype,
    });
    const response = await axios.post(this.food_url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data.labels;
  }

  async getIngredientOrMealByName(name: string, page: number, limit: number) {
    this.logger.log(`Searching for ingredient or meal by name: ${name}`);
    // search both ingredients and meals concurrently
    const [ingredientResult, mealResult] = await Promise.all([
      this.ingredientsService.searchByName(name, page, limit),
      this.mealsService.searchByName(name, page, limit),
    ]);

    // combine all results
    const combinedData = [
      ...ingredientResult.data.map((item) => ({ ...item, type: 'ingredient' })),
      ...mealResult.data.map((item) => ({ ...item, type: 'meal' })),
    ];

    return {
      total: ingredientResult.total + mealResult.total,
      data: combinedData,
    };
  }

  async getUserContributions(userId: string) {
    this.logger.log(`Getting all contributions for user: ${userId}`);
    // fetch both contribution types concurrently
    const [contributionMeals, contributionIngredients] = await Promise.all([
      this.contributionMealsService.findAllUser(userId),
      this.contributionIngresService.findAllUser(userId),
    ]);

    // combine all results with type tags
    const combinedData = [
      ...contributionMeals.map((item) => ({ ...item, type: 'meal' })),
      ...contributionIngredients.map((item) => ({ ...item, type: 'ingredient' })),
    ];

    return {
      total: contributionMeals.length + contributionIngredients.length,
      data: combinedData,
    };
  }
}
