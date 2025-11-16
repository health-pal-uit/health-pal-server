import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MedalsUsersService } from './medals_users.service';
import { CreateMedalsUserDto } from './dto/create-medals_user.dto';
import { UpdateMedalsUserDto } from './dto/update-medals_user.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('medals-users')
export class MedalsUsersController {
  constructor(private readonly medalsUsersService: MedalsUsersService) {}

  @Get()
  @UseGuards(SupabaseGuard)
  async checkFinishedMedals(@CurrentUser() user: any) {
    return await this.medalsUsersService.checkFinishedMedals(user.id);
  }

  @Post(':id')
  @UseGuards(SupabaseGuard)
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
