import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { ExpertSupabaseGuard } from 'src/auth/guards/supabase/expert-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreateMyConsultationDto } from './dto/create-my-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { EndConsultationDto } from './dto/end-consultation.dto';

@ApiTags('consultations')
@ApiBearerAuth()
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Create a new consultation (admin only)' })
  @ApiBody({ type: CreateConsultationDto })
  @ApiResponse({ status: 201, description: 'Consultation created' })
  async create(@Body() createConsultationDto: CreateConsultationDto, @CurrentUser() user: any) {
    return await this.consultationsService.create(createConsultationDto, user.id, user.role);
  }

  @Post('me')
  @UseGuards(ExpertSupabaseGuard)
  @ApiOperation({
    summary: 'Start a consultation for yourself (expert only)',
    description:
      'Start a consultation from a confirmed booking. Booking must be confirmed by both parties.',
  })
  @ApiBody({ type: CreateMyConsultationDto })
  @ApiResponse({ status: 201, description: 'Consultation started' })
  async createMe(
    @Body() createMyConsultationDto: CreateMyConsultationDto,
    @CurrentUser() user: any,
  ) {
    return await this.consultationsService.createMe(createMyConsultationDto, user.id, user.role);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all consultations' })
  @ApiResponse({ status: 200, description: 'List of consultations' })
  async findAll(@CurrentUser() user: any) {
    return await this.consultationsService.findAll(user.id, user.role);
  }

  @Get('me')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get my consultations',
    description: 'Get all consultations for the current user (auto-filtered by role)',
  })
  @ApiResponse({ status: 200, description: 'List of user consultations' })
  async getMyConsultations(@CurrentUser() user: any) {
    return await this.consultationsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get consultation by id' })
  @ApiParam({ name: 'id', description: 'Consultation id (UUID)' })
  @ApiResponse({ status: 200, description: 'Consultation details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.consultationsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update consultation' })
  @ApiParam({ name: 'id', description: 'Consultation id (UUID)' })
  @ApiBody({ type: UpdateConsultationDto })
  @ApiResponse({ status: 200, description: 'Consultation updated' })
  async update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @CurrentUser() user: any,
  ) {
    return await this.consultationsService.update(id, updateConsultationDto, user.id, user.role);
  }

  @Patch(':id/end')
  @UseGuards(SupabaseGuard) // Service validates expert or admin role
  @ApiOperation({ summary: 'End consultation (expert or admin only)' })
  @ApiParam({ name: 'id', description: 'Consultation id (UUID)' })
  @ApiBody({ type: EndConsultationDto })
  @ApiResponse({ status: 200, description: 'Consultation ended and ended_at set to now' })
  async end(
    @Param('id') id: string,
    @Body() endConsultationDto: EndConsultationDto,
    @CurrentUser() user: any,
  ) {
    return await this.consultationsService.endConsultation(
      id,
      endConsultationDto,
      user.id,
      user.role,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete consultation' })
  @ApiParam({ name: 'id', description: 'Consultation id (UUID)' })
  @ApiResponse({ status: 200, description: 'Consultation deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.consultationsService.remove(id, user.id, user.role);
  }
}
