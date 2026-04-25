import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { VideoCallsService } from './video_calls.service';
import { CreateVideoCallDto } from './dto/create-video_call.dto';
import { UpdateVideoCallDto } from './dto/update-video_call.dto';

@ApiTags('video-calls')
@ApiBearerAuth()
@Controller('video-calls')
export class VideoCallsController {
  constructor(private readonly videoCallsService: VideoCallsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Create a new video call' })
  @ApiBody({ type: CreateVideoCallDto })
  @ApiResponse({ status: 201, description: 'Video call created' })
  async create(@Body() createVideoCallDto: CreateVideoCallDto) {
    return await this.videoCallsService.create(createVideoCallDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all video calls' })
  @ApiResponse({ status: 200, description: 'List of video calls' })
  async findAll() {
    return await this.videoCallsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get video call by id' })
  @ApiParam({ name: 'id', description: 'Video call id (UUID)' })
  @ApiResponse({ status: 200, description: 'Video call details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.videoCallsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update video call' })
  @ApiParam({ name: 'id', description: 'Video call id (UUID)' })
  @ApiBody({ type: UpdateVideoCallDto })
  @ApiResponse({ status: 200, description: 'Video call updated' })
  async update(@Param('id') id: string, @Body() updateVideoCallDto: UpdateVideoCallDto) {
    return await this.videoCallsService.update(id, updateVideoCallDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete video call' })
  @ApiParam({ name: 'id', description: 'Video call id (UUID)' })
  @ApiResponse({ status: 200, description: 'Video call deleted' })
  async remove(@Param('id') id: string) {
    return await this.videoCallsService.remove(id);
  }
}
