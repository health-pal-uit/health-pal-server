import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FavIngresService } from './fav_ingres.service';
import { CreateFavIngreDto } from './dto/create-fav_ingre.dto';

import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { FavIngrePaginationDto } from './dto/fav-ingre-pagination.dto';

@ApiTags('FavIngres')
@ApiBearerAuth()
@Controller('fav-ingres')
export class FavIngresController {
  constructor(private readonly favIngresService: FavIngresService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add a favorite ingredient for a user' })
  @ApiBody({ type: CreateFavIngreDto })
  @ApiResponse({ status: 201, description: 'Favorite ingredient added.' })
  async create(@Body() createFavIngreDto: CreateFavIngreDto) {
    return await this.favIngresService.create(createFavIngreDto);
  }

  // find all of a user
  @Get('user')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all favorite ingredients for the current user' })
  @ApiResponse({ status: 200, description: 'List of favorite ingredients with ids.' })
  async findAllOfUser(@CurrentUserId() userId: string, @Query() query: FavIngrePaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.favIngresService.findAllOfUser(userId, page, limit);
  }
  // check if a specific ingredient is favorited by user
  @Get('user/:ingredientId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Check if an ingredient is favorited by the current user' })
  @ApiParam({ name: 'ingredientId', type: String })
  @ApiResponse({ status: 200, description: 'Favorited status.' })
  async isFavorited(@CurrentUserId() userId: string, @Param('ingredientId') ingredientId: string) {
    return { favorited: await this.favIngresService.isFavorited(userId, ingredientId) };
  }
  // remove by user and ingredient
  @Delete('user/:ingredientId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a favorite by user and ingredient' })
  @ApiParam({ name: 'ingredientId', type: String })
  @ApiResponse({ status: 200, description: 'Favorite removed.' })
  async removeByUserAndIngredient(
    @CurrentUserId() userId: string,
    @Param('ingredientId') ingredientId: string,
  ) {
    return await this.favIngresService.removeByUserAndIngredient(userId, ingredientId);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a favorite by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Favorite removed.' })
  async remove(@Param('id') id: string) {
    return await this.favIngresService.remove(id);
  }
}
