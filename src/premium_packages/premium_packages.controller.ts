import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PremiumPackagesService } from './premium_packages.service';
import { CreatePremiumPackageDto } from './dto/create-premium_package.dto';
import { UpdatePremiumPackageDto } from './dto/update-premium_package.dto';

@Controller('premium-packages')
export class PremiumPackagesController {
  constructor(private readonly premiumPackagesService: PremiumPackagesService) {}

  @Post()
  create(@Body() createPremiumPackageDto: CreatePremiumPackageDto) {
    return this.premiumPackagesService.create(createPremiumPackageDto);
  }

  @Get()
  findAll() {
    return this.premiumPackagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.premiumPackagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePremiumPackageDto: UpdatePremiumPackageDto) {
    return this.premiumPackagesService.update(+id, updatePremiumPackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.premiumPackagesService.remove(+id);
  }
}
