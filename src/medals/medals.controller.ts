import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MedalsService } from './medals.service';
import { CreateMedalDto } from './dto/create-medal.dto';
import { UpdateMedalDto } from './dto/update-medal.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('medals')
export class MedalsController {
  constructor(private readonly medalsService: MedalsService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createMedalDto: CreateMedalDto, @UploadedFile() file?: Express.Multer.File) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.medalsService.create(createMedalDto, imageBuffer, imageName);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  async findAll() {
    return await this.medalsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.medalsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateMedalDto: UpdateMedalDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.medalsService.update(id, updateMedalDto, imageBuffer, imageName);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.medalsService.remove(id);
  }
}
