import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChallengesUsersService } from './challenges_users.service';
import { CreateChallengesUserDto } from './dto/create-challenges_user.dto';
import { UpdateChallengesUserDto } from './dto/update-challenges_user.dto';

@Controller('challenges-users')
export class ChallengesUsersController {
  constructor(private readonly challengesUsersService: ChallengesUsersService) {}

  @Post()
  create(@Body() createChallengesUserDto: CreateChallengesUserDto) {
    return this.challengesUsersService.create(createChallengesUserDto);
  }

  @Get()
  findAll() {
    return this.challengesUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.challengesUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChallengesUserDto: UpdateChallengesUserDto) {
    return this.challengesUsersService.update(+id, updateChallengesUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.challengesUsersService.remove(+id);
  }
}
