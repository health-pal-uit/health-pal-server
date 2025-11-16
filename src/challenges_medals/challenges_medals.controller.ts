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
  async create(@Body() createChallengesMedalDto: CreateChallengesMedalDto) {
    return await this.challengesMedalsService.create(createChallengesMedalDto);
  }

  @Get()
  async findAll() {
    return await this.challengesMedalsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.challengesMedalsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChallengesMedalDto: UpdateChallengesMedalDto,
  ) {
    return await this.challengesMedalsService.update(id, updateChallengesMedalDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.challengesMedalsService.remove(id);
  }
}
