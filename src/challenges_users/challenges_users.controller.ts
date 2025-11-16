import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChallengesUsersService } from './challenges_users.service';
import { CreateChallengesUserDto } from './dto/create-challenges_user.dto';
import { UpdateChallengesUserDto } from './dto/update-challenges_user.dto';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@ApiBearerAuth()
@Controller('challenges-users')
export class ChallengesUsersController {
  constructor(private readonly challengesUsersService: ChallengesUsersService) {}

  @Get('finish')
  @UseGuards(SupabaseGuard)
  async checkFinishedChallenges(@CurrentUser() user: any) {
    return await this.challengesUsersService.checkFinishedChallenges(user.id);
  }

  @Post(':id')
  @UseGuards(SupabaseGuard)
  async finishChallenge(@Param('id') challengeId: string, @CurrentUser() user: any) {
    return await this.challengesUsersService.finishChallenge(challengeId, user.id);
  }

  // @Post()
  // create(@Body() createChallengesUserDto: CreateChallengesUserDto) {
  //   return this.challengesUsersService.create(createChallengesUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.challengesUsersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.challengesUsersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChallengesUserDto: UpdateChallengesUserDto) {
  //   return this.challengesUsersService.update(+id, updateChallengesUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.challengesUsersService.remove(+id);
  // }
}
