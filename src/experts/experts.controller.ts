import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { ExpertSupabaseGuard } from 'src/auth/guards/supabase/expert-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { ReqUserType } from 'src/auth/types/req.type';
import { ExpertsService } from './experts.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { CreateCurrentExpertDto } from './dto/create-current-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { VerifyExpertDto } from './dto/verify-expert.dto';

@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  @UseGuards(AdminSupabaseGuard)
  @Post()
  create(@Body() createExpertDto: CreateExpertDto) {
    return this.expertsService.create(createExpertDto);
  }

  @UseGuards(SupabaseGuard)
  @Post('me')
  @UseInterceptors(FileInterceptor('license_photo'))
  createCurrent(
    @Req() req: Request & { user: ReqUserType },
    @Body() dto: CreateCurrentExpertDto,
    @UploadedFile() licensePhoto?: Express.Multer.File,
  ) {
    if (!licensePhoto?.buffer || !licensePhoto?.originalname) {
      throw new BadRequestException('license_photo file is required');
    }

    return this.expertsService.createCurrentExpert(
      req.user.id,
      dto,
      licensePhoto.buffer,
      licensePhoto.originalname,
    );
  }

  @UseGuards(AdminSupabaseGuard)
  @Patch(':id/verify')
  verify(@Param('id') id: string, @Body() dto: VerifyExpertDto) {
    return this.expertsService.verifyExpert(id, dto.is_verified ?? true);
  }

  @UseGuards(AdminSupabaseGuard)
  @Get('admin/review')
  findAllForAdminReview() {
    return this.expertsService.findAllForAdminReview();
  }

  @Get()
  findAll() {
    return this.expertsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsService.findOne(id);
  }

  @UseGuards(ExpertSupabaseGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpertDto: UpdateExpertDto) {
    return this.expertsService.update(id, updateExpertDto);
  }

  @UseGuards(ExpertSupabaseGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertsService.remove(id);
  }
}
