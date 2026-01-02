import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FoodVisionService } from './food-vision.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import type { ReqUserType } from 'src/auth/types/req.type';

@Controller('food-vision')
export class FoodVisionController {
  constructor(private readonly foodVisionService: FoodVisionService) {}

  @UseGuards(SupabaseGuard)
  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFoodImage(@UploadedFile() image: Express.Multer.File) {
    return this.foodVisionService.analyzeFoodImage(image);
  }

  @UseGuards(SupabaseGuard)
  @Post('search')
  async getIngredientOrMealByName(
    @Body('name') name: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.foodVisionService.getIngredientOrMealByName(name, page, limit);
  }

  @UseGuards(SupabaseGuard)
  @Get('contributions/me')
  async getUserContributions(@CurrentUser() user: ReqUserType) {
    return this.foodVisionService.getUserContributions(user.id);
  }
}
