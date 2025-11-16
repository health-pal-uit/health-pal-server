import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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
  async create(@Body() createDailyIngreDto: CreateDailyIngreDto, @CurrentUser() user: any) {
    return await this.dailyIngresService.create(createDailyIngreDto, user.id);
  }

  // and many daily ingredients
  @Post('many')
  @UseGuards(SupabaseGuard)
  async createMany(@Body() createDailyIngreDtos: CreateDailyIngreDto[], @CurrentUser() user: any) {
    return await this.dailyIngresService.createMany(createDailyIngreDtos, user.id);
  }

  // get all daily ingredients, user => get all daily ingredients of the user
  @Get()
  @UseGuards(SupabaseGuard)
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.dailyIngresService.findAllByUser(user.id);
    }
    return await this.dailyIngresService.findAll();
  }

  // get daily ingredient by id
  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.dailyIngresService.findOneOwned(id, user.id);
  }

  // update daily ingredient by id
  @Patch(':id')
  @UseGuards(SupabaseGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDailyIngreDto: UpdateDailyIngreDto,
    @CurrentUser() user: any,
  ) {
    return await this.dailyIngresService.updateOneOwned(id, updateDailyIngreDto, user.id);
  }

  // delete daily ingredient by id
  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.dailyIngresService.removeOwned(id, user.id);
  }
}
