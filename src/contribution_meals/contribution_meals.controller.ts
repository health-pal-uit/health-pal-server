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
import { ContributionMealsService } from './contribution_meals.service';
import { CreateContributionMealDto } from './dto/create-contribution_meal.dto';
import { UpdateContributionMealDto } from './dto/update-contribution_meal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { IngredientPayload } from 'src/meals/dto/ingredient-payload.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('contribution-meals')
export class ContributionMealsController {
  constructor(private readonly contributionMealsService: ContributionMealsService) {}

  @Post() // user -> create new contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createContributionMealDto: CreateContributionMealDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      throw new Error('Admins cannot create contributions');
    }
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.contributionMealsService.create(
      createContributionMealDto,
      user.id,
      imageBuffer,
      imageName,
    );
  }

  @Post('ingredients')
  @UseGuards(SupabaseGuard)
  async createFromIngredients(
    @Body() body: { meal: CreateContributionMealDto; ingredients: IngredientPayload[] },
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.contributionMealsService.createFromIngredients(
      body.meal,
      body.ingredients,
      user.id,
    );
  }

  @Get() // admin
  @UseGuards(SupabaseGuard)
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionMealsService.findAllUser(user.id); // only their contributions
    }
    return await this.contributionMealsService.findAll();
  }

  @Get(':id') // admin
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionMealsService.findOneUser(id, user.id);
    }
    return await this.contributionMealsService.findOne(id);
  }

  @Patch(':id') // user => create update contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateContributionMealDto: UpdateContributionMealDto,
    @CurrentUser() user: any,
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
  async updateFromIngredients(
    @Param('id') id: string,
    @Body() ingredients: IngredientPayload[],
    @CurrentUser() user: any,
  ) {
    return await this.contributionMealsService.createContributionFromIngredients(
      id,
      ingredients,
      user.id,
    );
  }

  @Delete(':id') // user => create delete contribution
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.contributionMealsService.remove(id);
    }
    return await this.contributionMealsService.createDeleteContribution(id, user.id);
  }

  // admin approve

  @Get('approve/:id') // admin => approve contribution
  @UseGuards(AdminSupabaseGuard)
  async approve(@Param('id') id: string) {
    return await this.contributionMealsService.adminApprove(id);
  }

  // @Get('approve/:id') // admin => approve contribution
  // @UseGuards(AdminSupabaseGuard)
  // approve(@Param('id') id: string) {
  //   return this.contributionMealsService.adminApprove(id);
  // }

  @Get('reject/:id') // admin => reject contribution
  @UseGuards(AdminSupabaseGuard)
  async reject(@Param('id') id: string) {
    return await this.contributionMealsService.adminReject(id);
  }

  @Get('pending') // admin => get all pending contributions
  @UseGuards(AdminSupabaseGuard)
  async pending() {
    return await this.contributionMealsService.findAllPending();
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
