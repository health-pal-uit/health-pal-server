import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChallengesMedalsService } from './challenges_medals.service';
import { CreateChallengesMedalDto } from './dto/create-challenges_medal.dto';
import { UpdateChallengesMedalDto } from './dto/update-challenges_medal.dto';

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
    return this.challengesMedalsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChallengesMedalDto: UpdateChallengesMedalDto) {
    return this.challengesMedalsService.update(+id, updateChallengesMedalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.challengesMedalsService.remove(+id);
  }
}
