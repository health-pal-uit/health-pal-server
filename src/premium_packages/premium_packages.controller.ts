import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PremiumPackagesService } from './premium_packages.service';
import { CreatePremiumPackageDto } from './dto/create-premium_package.dto';
import { UpdatePremiumPackageDto } from './dto/update-premium_package.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('premium-packages')
export class PremiumPackagesController {
  constructor(private readonly premiumPackagesService: PremiumPackagesService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Create a new premium package (admin only)' })
  @ApiBody({ type: CreatePremiumPackageDto })
  @ApiResponse({ status: 201, description: 'Package created' })
  async create(@Body() createPremiumPackageDto: CreatePremiumPackageDto) {
    return await this.premiumPackagesService.create(createPremiumPackageDto);
  }

  @Get()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Get all premium packages (admin only)' })
  @ApiResponse({ status: 200, description: 'List of packages' })
  async findAll() {
    return await this.premiumPackagesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a specific premium package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package details' })
  async findOne(@Param('id') id: string) {
    return await this.premiumPackagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Update a premium package (admin only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiBody({ type: UpdatePremiumPackageDto })
  @ApiResponse({ status: 200, description: 'Package updated' })
  async update(@Param('id') id: string, @Body() updatePremiumPackageDto: UpdatePremiumPackageDto) {
    return await this.premiumPackagesService.update(id, updatePremiumPackageDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Remove a premium package (admin only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package removed' })
  async remove(@Param('id') id: string) {
    return await this.premiumPackagesService.remove(id);
  }
}
