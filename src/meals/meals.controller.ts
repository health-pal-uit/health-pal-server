import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { IngredientPayload } from './dto/ingredient-payload.type';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  // create meal - whole
  @Post()
  @UseGuards(AdminSupabaseGuard) // only admin
  create(@Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(createMealDto);
  }

  // create meal - from ingredients
  @Post('ingredients')
  @UseGuards(AdminSupabaseGuard) // only admin
  createFromIngredients(@Body() body: { meal: CreateMealDto; ingredients: IngredientPayload[] }) {
    return this.mealsService.createFromIngredients(body.meal, body.ingredients);
  }

  // admin find allx
  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  findAll() {
    return this.mealsService.findAll();
  }

  // user find all => verified only
  @Get()
  @UseGuards(SupabaseGuard)
  findAllUser() {
    return this.mealsService.findAllUser();
  }

  @Get(':id') // admin and user find one
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.mealsService.findOne(id);
  }

  @Patch(':id') // create update contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  @UseGuards(AdminSupabaseGuard)
  update(@Param('id') id: string, @Body() updateMealDto: UpdateMealDto) {
    return this.mealsService.update(id, updateMealDto);
  }

  @Delete(':id') // create delete contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  @UseGuards(AdminSupabaseGuard)
  remove(@Param('id') id: string) {
    return this.mealsService.remove(id);
  }

  @Patch(':id/ingredients') // create update contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user, if user is not admin then create contribution
  @UseGuards(AdminSupabaseGuard)
  updateFromIngredients(@Param('id') id: string, @Body() ingredients: IngredientPayload[]) {
    return this.mealsService.updateFromIngredients(id, ingredients); // for admin
  }

  // @Delete('ingredients/:id/:ingreId') // create delete contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  // removeFromIngredients(@Param('id') id: string, @Param('ingreId') ingreId: string) {
  //   return this.mealsService.removeFromIngredients(id, ingreId);
  // }
}
