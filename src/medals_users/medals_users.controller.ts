import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedalsUsersService } from './medals_users.service';
import { CreateMedalsUserDto } from './dto/create-medals_user.dto';
import { UpdateMedalsUserDto } from './dto/update-medals_user.dto';

@Controller('medals-users')
export class MedalsUsersController {
  constructor(private readonly medalsUsersService: MedalsUsersService) {}

  @Post()
  create(@Body() createMedalsUserDto: CreateMedalsUserDto) {
    return this.medalsUsersService.create(createMedalsUserDto);
  }

  @Get()
  findAll() {
    return this.medalsUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medalsUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedalsUserDto: UpdateMedalsUserDto) {
    return this.medalsUsersService.update(+id, updateMedalsUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medalsUsersService.remove(+id);
  }
}
