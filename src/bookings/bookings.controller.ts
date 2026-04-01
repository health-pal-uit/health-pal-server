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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created' })
  async create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user: any) {
    return await this.bookingsService.create(createBookingDto, user.id, user.role);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  async findAll(@CurrentUser() user: any) {
    return await this.bookingsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get booking by id' })
  @ApiParam({ name: 'id', description: 'Booking id (UUID)' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.bookingsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update booking' })
  @ApiParam({ name: 'id', description: 'Booking id (UUID)' })
  @ApiBody({ type: UpdateBookingDto })
  @ApiResponse({ status: 200, description: 'Booking updated' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: any,
  ) {
    return await this.bookingsService.update(id, updateBookingDto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete booking' })
  @ApiParam({ name: 'id', description: 'Booking id (UUID)' })
  @ApiResponse({ status: 200, description: 'Booking deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.bookingsService.remove(id, user.id, user.role);
  }
}
