import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { IngredientPayload } from './dto/ingredient-payload.type';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  // create meal - whole
  @Post()
  @UseGuards(AdminSupabaseGuard) // only admin
  async create(@Body() createMealDto: CreateMealDto) {
    return await this.mealsService.create(createMealDto);
  }

  // create meal - from ingredients
  @Post('ingredients')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AdminSupabaseGuard) // only admin
  async createFromIngredients(
    @Body() body: { meal: CreateMealDto; ingredients: IngredientPayload[] },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.mealsService.createFromIngredients(
      body.meal,
      body.ingredients,
      imageBuffer,
      imageName,
    );
  }

  // admin find all
  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  async findAll() {
    return await this.mealsService.findAll();
  }

  // user find all => verified only
  @Get()
  @UseGuards(SupabaseGuard)
  async findAllUser() {
    return await this.mealsService.findAllUser();
  }

  @Get(':id') // admin and user find one
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.mealsService.findOne(id);
  }

  @Patch(':id') // create update contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  @UseGuards(AdminSupabaseGuard)
  async update(@Param('id') id: string, @Body() updateMealDto: UpdateMealDto) {
    return await this.mealsService.update(id, updateMealDto);
  }

  @Delete(':id') // create delete contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  @UseGuards(AdminSupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.mealsService.remove(id);
  }

  @Patch(':id/ingredients') // create update contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user, if user is not admin then create contribution
  @UseGuards(AdminSupabaseGuard)
  async updateFromIngredients(@Param('id') id: string, @Body() ingredients: IngredientPayload[]) {
    return await this.mealsService.updateFromIngredients(id, ingredients); // for admin
  }

  // @Delete('ingredients/:id/:ingreId') // create delete contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  // removeFromIngredients(@Param('id') id: string, @Param('ingreId') ingreId: string) {
  //   return this.mealsService.removeFromIngredients(id, ingreId);
  // }
}
