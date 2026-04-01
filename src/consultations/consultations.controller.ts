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
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@ApiTags('consultations')
@ApiBearerAuth()
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Create a new consultation' })
  @ApiBody({ type: CreateConsultationDto })
  @ApiResponse({ status: 201, description: 'Consultation created' })
  async create(@Body() createConsultationDto: CreateConsultationDto, @CurrentUser() user: any) {
    return await this.consultationsService.create(createConsultationDto, user.id, user.role);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all consultations' })
  @ApiResponse({ status: 200, description: 'List of consultations' })
  async findAll(@CurrentUser() user: any) {
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

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete consultation' })
  @ApiParam({ name: 'id', description: 'Consultation id (UUID)' })
  @ApiResponse({ status: 200, description: 'Consultation deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.consultationsService.remove(id, user.id, user.role);
  }
}
