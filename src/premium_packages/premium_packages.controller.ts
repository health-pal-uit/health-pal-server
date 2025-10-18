import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PremiumPackagesService } from './premium_packages.service';
import { CreatePremiumPackageDto } from './dto/create-premium_package.dto';
import { UpdatePremiumPackageDto } from './dto/update-premium_package.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@Controller('premium-packages')
export class PremiumPackagesController {
  constructor(private readonly premiumPackagesService: PremiumPackagesService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  create(@Body() createPremiumPackageDto: CreatePremiumPackageDto) {
    return this.premiumPackagesService.create(createPremiumPackageDto);
  }

  @Get()
  @UseGuards(AdminSupabaseGuard)
  findAll() {
    return this.premiumPackagesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.premiumPackagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  update(@Param('id') id: string, @Body() updatePremiumPackageDto: UpdatePremiumPackageDto) {
    return this.premiumPackagesService.update(id, updatePremiumPackageDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  remove(@Param('id') id: string) {
    return this.premiumPackagesService.remove(id);
  }
}
