import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import type { ReqUserType } from 'src/auth/types/req.type';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { DevicePaginationDto } from './dto/device-pagination.dto';

@ApiBearerAuth()
@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Register a new device' })
  @ApiResponse({ status: 201, description: 'Device registered successfully.' })
  @ApiBody({ type: CreateDeviceDto })
  async registerDevice(@Body() createDeviceDto: CreateDeviceDto, @CurrentUser() user: ReqUserType) {
    // Attach user_id to DTO
    return await this.devicesService.registerDevice({ ...createDeviceDto, user_id: user.id });
  }

  @Patch('deactivate')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Deactivate a device (user only)' })
  @ApiResponse({ status: 200, description: 'Device deactivated.' })
  @ApiBody({ type: UpdateDeviceDto })
  async deactivateDevice(
    @CurrentUser() user: ReqUserType,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return await this.devicesService.deactivateDevice(user, updateDeviceDto);
  }

  // Admin: get all devices
  @Get('all')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin: Get all devices' })
  @ApiResponse({ status: 200, description: 'List all devices.' })
  async getAllDevices(@Query() query: DevicePaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.devicesService.getAllDevices(page, limit);
  }

  // User: get own devices
  @Get('own')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all devices for current user' })
  @ApiResponse({ status: 200, description: 'List user devices.' })
  async getOwnDevices(@CurrentUser() user: ReqUserType, @Query() query: DevicePaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.devicesService.getDevicesByUser(user.id, page, limit);
  }

  // User: get device by id
  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a device by id (user only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Device found.' })
  async getDeviceById(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.devicesService.getDeviceById(id, user.id);
  }

  // User: delete device by id
  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete a device by id (user only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Device deleted.' })
  async deleteDevice(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.devicesService.deleteDevice(id, user.id);
  }

  @Post('refresh-token')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Refresh device push token (user only)' })
  @ApiBody({ schema: { properties: { fcm_token: { type: 'string', example: 'new-fcm-token' } } } })
  @ApiResponse({ status: 200, description: 'Token refreshed.' })
  async refreshToken(@CurrentUser() user: ReqUserType, @Body() dto: { fcm_token: string }) {
    return await this.devicesService.refreshToken(user, dto);
  }
}
