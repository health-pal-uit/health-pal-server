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
import { CreateMyBookingDto } from './dto/create-my-booking.dto';
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

  @Post('me')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Create a booking for yourself',
    description: `
      If you are an expert: provide only expert_id (will be auto-filled with yours)
      If you are a user: provide only client_id (will be auto-filled with yours)
      Both expert and client IDs can be overridden, but will be auto-filled for convenience
    `,
  })
  @ApiBody({ type: CreateMyBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created' })
  async createMe(@Body() createMyBookingDto: CreateMyBookingDto, @CurrentUser() user: any) {
    return await this.bookingsService.createMe(createMyBookingDto, user.id, user.role);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  async findAll(@CurrentUser() user: any) {
    return await this.bookingsService.findAll(user.id, user.role);
  }

  @Get('me')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get my bookings',
    description: 'Get all bookings for the current user (auto-filtered by role)',
  })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  async getMyBookings(@CurrentUser() user: any) {
    return await this.bookingsService.findAll(user.id, user.role);
  }

  @Get('me/pending')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get my pending bookings',
    description:
      'Get pending bookings (waiting for both parties to confirm). Auto-filtered by role.',
  })
  @ApiResponse({ status: 200, description: 'List of pending bookings' })
  async getMyPendingBookings(@CurrentUser() user: any) {
    return await this.bookingsService.findPending(user.id, user.role);
  }

  @Get('me/verified')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get my verified/confirmed bookings',
    description: 'Get confirmed bookings (both parties verified). Auto-filtered by role.',
  })
  @ApiResponse({ status: 200, description: 'List of verified bookings' })
  async getMyVerifiedBookings(@CurrentUser() user: any) {
    return await this.bookingsService.findVerified(user.id, user.role);
  }

  @Get('me/denied')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get my denied bookings',
    description: 'Get cancelled/denied bookings. Auto-filtered by role.',
  })
  @ApiResponse({ status: 200, description: 'List of denied bookings' })
  async getMyDeniedBookings(@CurrentUser() user: any) {
    return await this.bookingsService.findDenied(user.id, user.role);
  }

  @Patch('me/:id/verify')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Confirm booking',
    description:
      'Confirm your participation in the booking. Expert confirms expert participation, clients confirm client participation. Booking is auto-confirmed only when both have confirmed.',
  })
  @ApiParam({ name: 'id', description: 'Booking id (UUID)' })
  @ApiResponse({ status: 200, description: 'Booking confirmed' })
  async verifyMe(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.bookingsService.confirmBooking(id, user.id, user.role);
  }

  @Patch('me/:id/deny')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Deny/reject booking',
    description: 'Deny or reject a booking. Can only be denied before both parties confirm.',
  })
  @ApiParam({ name: 'id', description: 'Booking id (UUID)' })
  @ApiResponse({ status: 200, description: 'Booking denied' })
  async denyMe(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.bookingsService.denyBooking(id, user.id, user.role);
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
