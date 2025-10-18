import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @UseGuards(AdminSupabaseGuard)
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }
}
