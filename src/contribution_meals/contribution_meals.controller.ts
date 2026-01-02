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
} from '@nestjs/common';
import { ContributionMealPaginationDto } from './dto/contribution-meal-pagination.dto';
import { ContributionMealsService } from './contribution_meals.service';
import { CreateContributionMealDto } from './dto/create-contribution_meal.dto';
import { UpdateContributionMealDto } from './dto/update-contribution_meal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { IngredientPayload } from 'src/meals/dto/ingredient-payload.type';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import type { ReqUserType } from 'src/auth/types/req.type';

@ApiBearerAuth()
@Controller('contribution-meals')
export class ContributionMealsController {
  constructor(private readonly contributionMealsService: ContributionMealsService) {}

  @Post() // user -> create new contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'User creates a new meal contribution' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Contribution data and optional image',
    type: CreateContributionMealDto,
  })
  @ApiResponse({ status: 201, description: 'Contribution created' })
  @ApiResponse({ status: 403, description: 'Admins cannot create contributions' })
  async create(
    @Body() createContributionMealDto: CreateContributionMealDto,
    @CurrentUser() user: ReqUserType,
    @UploadedFile() _file?: Express.Multer.File,
  ) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      throw new Error('Admins cannot create contributions');
    }
    const imageBuffer = _file?.buffer;
    const imageName = _file?.originalname;
    return await this.contributionMealsService.create(
      createContributionMealDto,
      user.id,
      imageBuffer,
      imageName,
    );
  }

  private parseFlatFormData(body: any): {
    meal: CreateContributionMealDto;
    ingredients: IngredientPayload[];
  } {
    const meal: any = {};
    const ingredientsMap: Map<number, any> = new Map();

    // Parse flattened form-data into nested objects
    for (const [key, value] of Object.entries(body)) {
      // Handle meal.* fields
      if (key.startsWith('meal.')) {
        const fieldName = key.substring(5); // Remove 'meal.' prefix
        meal[fieldName] = value;
      }
      // Handle ingredients[index].* fields
      else if (key.startsWith('ingredients[')) {
        const match = key.match(/ingredients\[(\d+)\]\.(.+)/);
        if (match) {
          const index = parseInt(match[1], 10);
          const fieldName = match[2];

          if (!ingredientsMap.has(index)) {
            ingredientsMap.set(index, {});
          }

          const ingredient = ingredientsMap.get(index);
          // Convert quantity_kg to number
          if (fieldName === 'quantity_kg') {
            ingredient[fieldName] = parseFloat(value as string);
          } else {
            ingredient[fieldName] = value;
          }
        }
      }
    }

    // Convert map to array, sorted by index
    const ingredients = Array.from(ingredientsMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([_, ingredient]) => ingredient);

    return { meal, ingredients };
  }

  @Post('ingredients')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'User creates a meal contribution from ingredients' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Meal DTO and ingredients array',
    schema: {
      type: 'object',
      properties: {
        'meal.name': { type: 'string', example: 'Chicken Rice' },
        'meal.tags': { type: 'array', items: { type: 'string' } },
        'meal.notes': { type: 'string' },
        'ingredients[0].ingredient_id': { type: 'string', format: 'uuid' },
        'ingredients[0].quantity_kg': { type: 'number' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Contribution created from ingredients' })
  async createFromIngredients(
    @Body() body: any,
    @CurrentUser() user: ReqUserType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let mealDto: CreateContributionMealDto;
    let ingredientsPayload: IngredientPayload[];

    // Check if body has nested structure (meal object exists)
    if (body.meal && typeof body.meal === 'object') {
      // Direct nested object format
      mealDto = body.meal;
      ingredientsPayload = body.ingredients;
    } else if (body.meal && typeof body.meal === 'string') {
      // JSON string format
      mealDto = JSON.parse(body.meal);
      ingredientsPayload = JSON.parse(body.ingredients);
    } else if (Object.keys(body).some((key) => key.startsWith('meal.'))) {
      // Flattened form-data format (meal.name, ingredients[0].*, etc.)
      const parsed = this.parseFlatFormData(body);
      mealDto = parsed.meal as CreateContributionMealDto;
      ingredientsPayload = parsed.ingredients as IngredientPayload[];
    } else {
      console.error('Request body:', JSON.stringify(body, null, 2));
      throw new Error('Invalid request format. Please send meal and ingredients data.');
    }

    // Validate parsed data
    if (!mealDto || !mealDto.name) {
      throw new Error('Meal name is required');
    }
    if (
      !ingredientsPayload ||
      !Array.isArray(ingredientsPayload) ||
      ingredientsPayload.length === 0
    ) {
      throw new Error('At least one ingredient is required');
    }

    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.contributionMealsService.createFromIngredients(
      mealDto,
      ingredientsPayload,
      user.id,
      imageBuffer,
      imageName,
    );
  }

  @Get('pending') // admin => get all pending contributions
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin gets all pending meal contributions' })
  @ApiResponse({ status: 200, description: 'List of pending contributions' })
  async pending(@Query() query: ContributionMealPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.contributionMealsService.findAllPending(page, limit);
  }

  @Get('rejected') // admin => get all rejected contributions
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin gets all rejected meal contributions' })
  @ApiResponse({ status: 200, description: 'List of rejected contributions' })
  async rejected(@Query() query: ContributionMealPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.contributionMealsService.findAllRejected(page, limit);
  }

  @Get('rejection-info/:id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'User gets rejection reason/status for their own meal contribution' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Rejection info' })
  async getRejectionInfo(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    // Only allow user to see their own contribution's rejection info
    return await this.contributionMealsService.getRejectionInfo(id, user.id);
  }

  @Get() // admin
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'List all contributions (admin) or user contributions (user)' })
  @ApiResponse({ status: 200, description: 'List of contributions' })
  async findAll(@CurrentUser() user: ReqUserType, @Query() query: ContributionMealPaginationDto) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionMealsService.findAllUser(user.id); // only their contributions
    }
    const { page = 1, limit = 10 } = query;
    return await this.contributionMealsService.findAll(page, limit);
  }

  @Get(':id') // admin
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a contribution by id (admin or user)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution detail' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionMealsService.findOneUser(id, user.id);
    }
    return await this.contributionMealsService.findOne(id);
  }

  @Patch(':id') // user => create update contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'User updates their pending meal contribution' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update data and optional image',
    type: UpdateContributionMealDto,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution updated' })
  @ApiResponse({ status: 403, description: 'Admins cannot update contributions' })
  async update(
    @Param('id') id: string,
    @Body() updateContributionMealDto: UpdateContributionMealDto,
    @CurrentUser() user: ReqUserType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // check if user or admin
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      throw new Error('Admins cannot create update contributions');
    }
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.contributionMealsService.createUpdateContribution(
      id,
      updateContributionMealDto,
      user.id,
      imageBuffer,
      imageName,
    );
  }

  @Patch(':id/ingredients') // create update contribution -> if made from ingredients => whole another route, also need to distinguish between admin and user, if user is not admin then create contribution
  @UseGuards(SupabaseGuard) // user
  @ApiOperation({ summary: 'User updates meal contribution from ingredients' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    description: 'Ingredients array',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/IngredientPayload' },
    },
  })
  @ApiResponse({ status: 200, description: 'Contribution updated from ingredients' })
  async updateFromIngredients(
    @Param('id') id: string,
    @Body() ingredients: IngredientPayload[],
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.contributionMealsService.createContributionFromIngredients(
      id,
      ingredients,
      user.id,
    );
  }

  @Delete(':id') // user => create delete contribution
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'User deletes their pending contribution or admin hard deletes' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.contributionMealsService.remove(id);
    }
    return await this.contributionMealsService.createDeleteContribution(id, user.id);
  }

  // admin approve

  @Patch(':id/approve') // admin => approve contribution
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin approves a meal contribution' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution approved' })
  async approve(@Param('id') id: string) {
    return await this.contributionMealsService.adminApprove(id);
  }

  // @Get('approve/:id') // admin => approve contribution
  // @UseGuards(AdminSupabaseGuard)
  // approve(@Param('id') id: string) {
  //   return this.contributionMealsService.adminApprove(id);
  // }

  @Patch(':id/reject') // admin => reject contribution with reason
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin rejects a meal contribution with a reason' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { properties: { rejection_reason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Contribution rejected' })
  async reject(@Param('id') id: string, @Body('rejection_reason') reason: string) {
    return await this.contributionMealsService.adminReject(id, reason);
  }

  // @Post()
  // create(@Body() createContributionMealDto: CreateContributionMealDto) {
  //   return this.contributionMealsService.create(createContributionMealDto);
  // }

  // @Get()
  // findAll() {
  //   return this.contributionMealsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.contributionMealsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateContributionMealDto: UpdateContributionMealDto) {
  //   return this.contributionMealsService.update(+id, updateContributionMealDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.contributionMealsService.remove(+id);
  // }
}
