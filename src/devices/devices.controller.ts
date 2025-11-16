import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @UseGuards(SupabaseGuard)
  async registerDevice(@Body() createDeviceDto: CreateDeviceDto) {
    return await this.devicesService.registerDevice(createDeviceDto);
  }

  @Patch('deactivate')
  @UseGuards(SupabaseGuard)
  async deactivateDevice(@CurrentUser() user, @Body() updateDeviceDto: UpdateDeviceDto) {
    return await this.devicesService.deactivateDevice(user, updateDeviceDto);
  }

  @Get('own')
  @UseGuards(AdminSupabaseGuard)
  async getAllDevices(@CurrentUser() user) {
    return await this.devicesService.getAllDevices(user);
  }

  @Post('refresh-token')
  async refreshToken(@CurrentUser() user, @Body() dto: { fcm_token: string }) {
    return await this.devicesService.refreshToken(user, dto);
  }
}
