import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import type { ReqUserType } from 'src/auth/types/req.type';
import { DailyIngresService } from './daily_ingres.service';
import { CreateDailyIngreDto } from './dto/create-daily_ingre.dto';
import { UpdateDailyIngreDto } from './dto/update-daily_ingre.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('daily-ingres')
export class DailyIngresController {
  constructor(private readonly dailyIngresService: DailyIngresService) {}

  // add new daily ingredient
  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add a new daily ingredient for the current user' })
  @ApiBody({ type: CreateDailyIngreDto })
  @ApiResponse({ status: 201, description: 'Daily ingredient created' })
  async create(@Body() createDailyIngreDto: CreateDailyIngreDto, @CurrentUser() user: ReqUserType) {
    return await this.dailyIngresService.create(createDailyIngreDto, user.id);
  }

  // and many daily ingredients
  @Post('many')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add many daily ingredients for the current user' })
  @ApiBody({ type: [CreateDailyIngreDto] })
  @ApiResponse({ status: 201, description: 'Daily ingredients created' })
  async createMany(
    @Body() createDailyIngreDtos: CreateDailyIngreDto[],
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.dailyIngresService.createMany(createDailyIngreDtos, user.id);
  }

  // get all daily ingredients, user => get all daily ingredients of the user
  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all daily ingredients (admin: all, user: own)' })
  @ApiResponse({ status: 200, description: 'List of daily ingredients' })
  async findAll(@CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.dailyIngresService.findAllByUser(user.id);
    }
    return await this.dailyIngresService.findAll();
  }

  // get daily ingredient by id
  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a daily ingredient by id (user: own only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Daily ingredient detail' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.dailyIngresService.findOneOwned(id, user.id);
  }

  // update daily ingredient by id
  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update a daily ingredient by id (user: own only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDailyIngreDto })
  @ApiResponse({ status: 200, description: 'Daily ingredient updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDailyIngreDto: UpdateDailyIngreDto,
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.dailyIngresService.updateOneOwned(id, updateDailyIngreDto, user.id);
  }

  // delete daily ingredient by id
  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete a daily ingredient by id (user: own only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Daily ingredient deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.dailyIngresService.removeOwned(id, user.id);
  }
}
