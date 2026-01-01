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
  Query,
} from '@nestjs/common';
import { MedalsService } from './medals.service';
import { CreateMedalDto } from './dto/create-medal.dto';
import { UpdateMedalDto } from './dto/update-medal.dto';
import { CreateMedalWithChallengesDto } from './dto/create-medal-with-challenges.dto';
import { UpdateMedalWithChallengesDto } from './dto/update-medal-with-challenges.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { MedalPaginationDto } from './medal-pagination.dto';

@ApiBearerAuth()
@Controller('medals')
export class MedalsController {
  constructor(private readonly medalsService: MedalsService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Admin creates a new medal and links to challenges' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Medal data and optional image',
    type: CreateMedalDto,
  })
  @ApiResponse({ status: 201, description: 'Medal created' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async create(@Body() createMedalDto: CreateMedalDto, @UploadedFile() file?: Express.Multer.File) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.medalsService.create(createMedalDto, imageBuffer, imageName);
  }

  @Post('with-challenges')
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Create medal with challenges and activity records',
    description: 'Admin only - Creates a medal, its challenges, and activity records in one call',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Medal, challenges, and records created' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async createWithChallenges(
    @Body() createDto: CreateMedalWithChallengesDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.medalsService.createWithChallenges(createDto, imageBuffer, imageName);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all medals (users and admins)' })
  @ApiResponse({ status: 200, description: 'List of medals' })
  async findAll(@Query() query: MedalPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.medalsService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a medal by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Medal ID' })
  @ApiResponse({ status: 200, description: 'Medal details' })
  @ApiResponse({ status: 404, description: 'Medal not found' })
  async findOne(@Param('id') id: string) {
    return await this.medalsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Admin updates a medal and its challenge links' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update data and optional image',
    type: UpdateMedalDto,
  })
  @ApiParam({ name: 'id', type: String, description: 'Medal ID' })
  @ApiResponse({ status: 200, description: 'Medal updated' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async update(
    @Param('id') id: string,
    @Body() updateMedalDto: UpdateMedalDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.medalsService.update(id, updateMedalDto, imageBuffer, imageName);
  }

  @Patch(':id/with-challenges')
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Update medal and add new challenges with activity records',
    description: 'Admin only - Updates a medal and can add new challenges and activity records',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: String, description: 'Medal ID' })
  @ApiResponse({ status: 200, description: 'Medal and challenges updated' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async updateWithChallenges(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedalWithChallengesDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.medalsService.updateWithChallenges(id, updateDto, imageBuffer, imageName);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin deletes a medal' })
  @ApiParam({ name: 'id', type: String, description: 'Medal ID' })
  @ApiResponse({ status: 200, description: 'Medal deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async remove(@Param('id') id: string) {
    return await this.medalsService.remove(id);
  }
}
