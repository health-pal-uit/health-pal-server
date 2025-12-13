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
  ForbiddenException,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { ReqUserType } from 'src/auth/types/req.type';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { IngredientPaginationDto } from './dto/ingredient-pagination.dto';

@ApiBearerAuth()
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @UseGuards(AdminSupabaseGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Admin creates a new ingredient' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Ingredient data and optional image',
    type: CreateIngredientDto,
  })
  @ApiResponse({ status: 201, description: 'Ingredient created' })
  async create(
    @Body() createIngredientDto: CreateIngredientDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.ingredientsService.create(createIngredientDto, imageBuffer, imageName);
  }

  @Post('search')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Search ingredients by name for users' })
  @ApiResponse({ status: 201, description: 'List of matching ingredients' })
  async searchIngredients(@Body('name') name: string, @Query() query: IngredientPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.ingredientsService.searchByName(name, page, limit);
  }

  // get all admin
  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin gets all ingredients (including unverified)' })
  @ApiResponse({ status: 200, description: 'List of all ingredients' })
  async findAll(@Query() query: IngredientPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.ingredientsService.findAll(page, limit);
  }

  // get all user (verified only)
  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'User gets all verified ingredients' })
  @ApiResponse({ status: 200, description: 'List of verified ingredients' })
  async findAllUser(@Query() query: IngredientPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.ingredientsService.findAllUser(page, limit);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get an ingredient by ID (admin sees all, user sees only verified)' })
  @ApiParam({ name: 'id', type: String, description: 'Ingredient ID' })
  @ApiResponse({ status: 200, description: 'Ingredient details' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    const isAdmin = user.role === 'admin';
    const ingredient = isAdmin
      ? await this.ingredientsService.findOne(id)
      : await this.ingredientsService.findOneUser(id);

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  // update ingredient admin
  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Admin updates an ingredient (users must use contributions)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update data and optional image',
    type: UpdateIngredientDto,
  })
  @ApiParam({ name: 'id', type: String, description: 'Ingredient ID' })
  @ApiResponse({ status: 200, description: 'Ingredient updated' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @CurrentUser() user: ReqUserType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required to update ingredients');
    }
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.ingredientsService.update(id, updateIngredientDto, imageBuffer, imageName);
  }

  // admin delete
  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Admin deletes an ingredient (users must use contributions)' })
  @ApiParam({ name: 'id', type: String, description: 'Ingredient ID' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      //return this.ingredientsService.removeUser(id, user.id);
      throw new ForbiddenException('Admin access required to delete ingredients');
    }
    return await this.ingredientsService.remove(id);
  }

  @Patch(':id/restore')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Admin restores a soft-deleted ingredient' })
  @ApiParam({ name: 'id', type: String, description: 'Ingredient ID' })
  @ApiResponse({ status: 200, description: 'Ingredient restored' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async restore(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required to restore ingredients');
    }
    return await this.ingredientsService.restore(id);
  }

  // // verify ingredient
  // @UseGuards(AdminSupabaseGuard)
  // @Get('verify/:id')
  // verify(@Param('id') id: string) {
  //   return this.ingredientsService.verify(id);
  // }
}
