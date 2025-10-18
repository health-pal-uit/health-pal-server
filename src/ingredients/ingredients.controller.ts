import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @UseGuards(AdminSupabaseGuard)
  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  // get all admin
  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  findAll() {
    return this.ingredientsService.findAll();
  }

  // get all user (verified only)
  @Get()
  @UseGuards(SupabaseGuard)
  findAllUser() {
    return this.ingredientsService.findAllUser();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(id);
  }

  // update ingredient admin
  @Patch(':id')
  @UseGuards(SupabaseGuard)
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      throw new Error('Go to contribution to update');
    }
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  // admin delete
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      //return this.ingredientsService.removeUser(id, user.id);
      throw new Error('Go to contribution to delete');
    }
    return this.ingredientsService.remove(id);
  }

  // // verify ingredient
  // @UseGuards(AdminSupabaseGuard)
  // @Get('verify/:id')
  // verify(@Param('id') id: string) {
  //   return this.ingredientsService.verify(id);
  // }
}
