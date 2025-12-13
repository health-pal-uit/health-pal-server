import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FoodVisionService } from './food-vision.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('food-vision')
export class FoodVisionController {
  constructor(private readonly foodVisionService: FoodVisionService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFoodImage(@UploadedFile() image: Express.Multer.File) {
    return this.foodVisionService.analyzeFoodImage(image);
  }

  @Post('get-by-name')
  async getIngredientOrMealByName(@Body('name') name: string) {
    return this.foodVisionService.getIngredientOrMealByName(name);
  }
}
