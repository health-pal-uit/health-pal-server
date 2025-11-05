import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChallengesMedalsService } from './challenges_medals.service';
import { CreateChallengesMedalDto } from './dto/create-challenges_medal.dto';
import { UpdateChallengesMedalDto } from './dto/update-challenges_medal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('challenges-medals')
export class ChallengesMedalsController {
  constructor(private readonly challengesMedalsService: ChallengesMedalsService) {}

  @Post()
  create(@Body() createChallengesMedalDto: CreateChallengesMedalDto) {
    return this.challengesMedalsService.create(createChallengesMedalDto);
  }

  @Get()
  findAll() {
    return this.challengesMedalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.challengesMedalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChallengesMedalDto: UpdateChallengesMedalDto) {
    return this.challengesMedalsService.update(id, updateChallengesMedalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.challengesMedalsService.remove(id);
  }
}
