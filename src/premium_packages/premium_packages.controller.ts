import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PremiumPackagesService } from './premium_packages.service';
import { CreatePremiumPackageDto } from './dto/create-premium_package.dto';
import { UpdatePremiumPackageDto } from './dto/update-premium_package.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('premium-packages')
export class PremiumPackagesController {
  constructor(private readonly premiumPackagesService: PremiumPackagesService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  async create(@Body() createPremiumPackageDto: CreatePremiumPackageDto) {
    return await this.premiumPackagesService.create(createPremiumPackageDto);
  }

  @Get()
  @UseGuards(AdminSupabaseGuard)
  async findAll() {
    return await this.premiumPackagesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.premiumPackagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  async update(@Param('id') id: string, @Body() updatePremiumPackageDto: UpdatePremiumPackageDto) {
    return await this.premiumPackagesService.update(id, updatePremiumPackageDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.premiumPackagesService.remove(id);
  }
}
