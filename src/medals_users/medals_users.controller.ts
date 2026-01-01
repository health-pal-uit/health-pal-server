import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MedalsUsersService } from './medals_users.service';
import { CreateMedalsUserDto } from './dto/create-medals_user.dto';
import { UpdateMedalsUserDto } from './dto/update-medals_user.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { MedalsUserPaginationDto } from './medals-user-pagination.dto';

@ApiBearerAuth()
@Controller('medals-users')
export class MedalsUsersController {
  constructor(private readonly medalsUsersService: MedalsUsersService) {}

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Check finished medals for the current user' })
  @ApiResponse({ status: 200, description: 'List of finished medals' })
  async checkFinishedMedals(@CurrentUser() user: any, @Query() query: MedalsUserPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.medalsUsersService.checkFinishedMedals(user.id, page, limit);
  }

  @Get('unfinished')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get unfinished medals for current user' })
  @ApiResponse({ status: 200, description: 'List of unfinished medals' })
  async checkUnfinishedMedals(@CurrentUser() user: any, @Query() query: MedalsUserPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.medalsUsersService.checkUnfinishedMedals(user.id, page, limit);
  }

  @Post(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Finish a medal for the current user' })
  @ApiParam({ name: 'id', description: 'Medal ID' })
  @ApiResponse({ status: 201, description: 'Medal finished successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or medal already finished' })
  async finishMedal(@Param('id') medalId: string, @CurrentUser() user: any) {
    return await this.medalsUsersService.finishMedal(medalId, user.id);
  }

  // @Post()
  // create(@Body() createMedalsUserDto: CreateMedalsUserDto) {
  //   return this.medalsUsersService.create(createMedalsUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.medalsUsersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.medalsUsersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMedalsUserDto: UpdateMedalsUserDto) {
  //   return this.medalsUsersService.update(+id, updateMedalsUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.medalsUsersService.remove(+id);
  // }
}
