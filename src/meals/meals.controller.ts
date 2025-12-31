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
  Query,
  NotFoundException,
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
import type { ReqUserType } from 'src/auth/types/req.type';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { MealPaginationDto } from './dto/meal-pagination.dto';

@ApiBearerAuth()
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  // create meal - whole
  @Post()
  @UseGuards(AdminSupabaseGuard) // only admin
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Admin creates a new meal with pre-calculated nutrition' })
  @ApiBody({ type: CreateMealDto })
  @ApiResponse({ status: 201, description: 'Meal created' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async create(@Body() createMealDto: CreateMealDto, @UploadedFile() file?: Express.Multer.File) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.mealsService.create(createMealDto, imageBuffer, imageName);
  }

  // create meal - from ingredients
  @Post('ingredients')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AdminSupabaseGuard) // only admin
  @ApiOperation({ summary: 'Admin creates a meal from ingredients (calculates nutrition)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Meal data and ingredients array',
    schema: {
      type: 'object',
      properties: {
        meal: { $ref: '#/components/schemas/CreateMealDto' },
        ingredients: { type: 'array', items: { $ref: '#/components/schemas/IngredientPayload' } },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Meal created from ingredients' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
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

  @Post('search')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Search meals by name for users' })
  @ApiResponse({ status: 201, description: 'List of matching meals' })
  async searchMeals(@Body('name') name: string, @Query() query: MealPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.mealsService.searchByName(name, page, limit);
  }

  // admin find all
  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin gets all meals (including unverified)' })
  @ApiResponse({ status: 200, description: 'List of all meals' })
  async findAll(@Query() query: MealPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.mealsService.findAll(page, limit);
  }

  // user find all => verified only
  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'User gets all verified meals' })
  @ApiResponse({ status: 200, description: 'List of verified meals' })
  async findAllUser(@Query() query: MealPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.mealsService.findAllUser(page, limit);
  }

  @Get(':id') // admin and user find one
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a meal by ID (admin sees all, user sees only verified)' })
  @ApiParam({ name: 'id', type: String, description: 'Meal ID' })
  @ApiResponse({ status: 200, description: 'Meal details' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    const meal = isAdmin
      ? await this.mealsService.findOne(id)
      : await this.mealsService.findOneUser(id);

    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }
    return meal;
  }

  @Patch(':id') // create update contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Admin updates a meal (users must use contributions)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateMealDto })
  @ApiParam({ name: 'id', type: String, description: 'Meal ID' })
  @ApiResponse({ status: 200, description: 'Meal updated' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async update(
    @Param('id') id: string,
    @Body() updateMealDto: UpdateMealDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.mealsService.update(id, updateMealDto, imageBuffer, imageName);
  }

  @Delete(':id') // create delete contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin deletes a meal (users must use contributions)' })
  @ApiParam({ name: 'id', type: String, description: 'Meal ID' })
  @ApiResponse({ status: 200, description: 'Meal deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async remove(@Param('id') id: string) {
    return await this.mealsService.remove(id);
  }

  @Patch(':id/ingredients') // create update contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user, if user is not admin then create contribution
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Admin updates meal ingredients (replaces all and recalculates nutrition)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Meal ID' })
  @ApiBody({
    description: 'Ingredients array',
    schema: { type: 'array', items: { $ref: '#/components/schemas/IngredientPayload' } },
  })
  @ApiResponse({ status: 200, description: 'Meal updated from ingredients' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async updateFromIngredients(@Param('id') id: string, @Body() ingredients: IngredientPayload[]) {
    return await this.mealsService.updateFromIngredients(id, ingredients); // for admin
  }

  // @Delete('ingredients/:id/:ingreId') // create delete contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user
  // removeFromIngredients(@Param('id') id: string, @Param('ingreId') ingreId: string) {
  //   return this.mealsService.removeFromIngredients(id, ingreId);
  // }
}
