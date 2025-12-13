import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { IngredientsService } from 'src/ingredients/ingredients.service';
import { MealsService } from 'src/meals/meals.service';

@Injectable()
export class FoodVisionService {
  private readonly logger = new Logger(FoodVisionService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly mealsService: MealsService,
    private readonly ingredientsService: IngredientsService,
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

  async getIngredientOrMealByName(name: string) {
    this.logger.log(`Searching for ingredient or meal by name: ${name}`);
    // search ingredient first
    const ingredientResult = await this.ingredientsService.searchByName(name, 1, 1);
    if (ingredientResult.total > 0) {
      return { type: 'ingredient', data: ingredientResult.data[0] };
    }
    // search meal next
    const mealResult = await this.mealsService.searchByName(name, 1, 1);
    if (mealResult.total > 0) {
      return { type: 'meal', data: mealResult.data[0] };
    }
    return { type: 'none', data: null };
  }
}
