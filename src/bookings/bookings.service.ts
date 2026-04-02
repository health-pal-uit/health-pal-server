import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateMyBookingDto } from './dto/create-my-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import {
  Booking,
  BookingCallType,
  BookingStatus,
  BookingConfirmationStatus,
} from './entities/booking.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { User } from 'src/users/entities/user.entity';
import { Consultation } from 'src/consultations/entities/consultation.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
  ) {}

  private validateScheduledAt(scheduledAt: Date): void {
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid scheduled_at value');
    }
  }

  private ensureOwnership(booking: Booking, currentUserId: string, currentUserRole?: string): void {
    if (currentUserRole === 'admin') {
      return;
    }

    if (currentUserRole === 'expert' && booking.expert?.user?.id === currentUserId) {
      return;
    }

    if (booking.client?.id !== currentUserId) {
      throw new ForbiddenException('You can only access your own bookings');
    }
  }

  private async ensureExpertTimeAvailable(
    expertId: string,
    scheduledAt: Date,
    excludeBookingId?: string,
  ): Promise<void> {
    const conflict = await this.bookingRepository.findOne({
      where: {
        ...(excludeBookingId ? { id: Not(excludeBookingId) } : {}),
        expert: { id: expertId },
        scheduled_at: scheduledAt,
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        deleted_at: IsNull(),
      },
    });

    if (conflict) {
      throw new ConflictException('Expert is not available at this scheduled time');
    }
  }

  private async validateVideoCapability(expertId: string, callType?: BookingCallType) {
    if (callType !== BookingCallType.VIDEO) {
      return;
    }

    const expert = await this.expertRepository.findOne({
      where: { id: expertId, deleted_at: IsNull() },
      relations: ['expert_role'],
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    if (!expert.expert_role?.can_do_video) {
      throw new BadRequestException('Selected expert role does not support video consultations');
    }
  }

  async create(
    createBookingDto: CreateBookingDto,
    currentUserId: string,
    currentUserRole?: string,
  ): Promise<Booking> {
    const effectiveClientId =
      currentUserRole === 'admin' ? createBookingDto.client_id : currentUserId;

    if (currentUserRole !== 'admin' && createBookingDto.client_id !== currentUserId) {
      throw new ForbiddenException('You can only create bookings for yourself');
    }

    const [expert, client] = await Promise.all([
      this.expertRepository.findOne({
        where: { id: createBookingDto.expert_id, deleted_at: IsNull() },
      }),
      this.userRepository.findOne({
        where: { id: effectiveClientId, deactivated_at: IsNull() },
      }),
    ]);

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const scheduledAt = new Date(createBookingDto.scheduled_at);
    this.validateScheduledAt(scheduledAt);
    await this.validateVideoCapability(expert.id, createBookingDto.call_type);
    await this.ensureExpertTimeAvailable(expert.id, scheduledAt);

    const effectiveStatus =
      currentUserRole === 'admin'
        ? (createBookingDto.status ?? BookingStatus.PENDING)
        : BookingStatus.PENDING;

    const booking = this.bookingRepository.create({
      call_type: createBookingDto.call_type,
      status: effectiveStatus,
      scheduled_at: scheduledAt,
      client_note: createBookingDto.client_note ?? null,
      expert,
      client,
    });

    const saved = await this.bookingRepository.save(booking);
    return await this.findOne(saved.id);
  }

  async createMe(
    createMyBookingDto: CreateMyBookingDto,
    currentUserId: string,
    currentUserRole?: string,
  ): Promise<Booking> {
    // Auto-fill expert_id or client_id based on user role
    const createBookingDto: CreateBookingDto = {
      expert_id: createMyBookingDto.expert_id || '',
      client_id: createMyBookingDto.client_id || '',
      call_type: createMyBookingDto.call_type,
      status: createMyBookingDto.status,
      scheduled_at: createMyBookingDto.scheduled_at,
      client_note: createMyBookingDto.client_note,
    };

    if (currentUserRole === 'expert') {
      if (!createBookingDto.client_id) {
        throw new BadRequestException('client_id is required when booking as an expert');
      }
      const expert = await this.expertRepository.findOne({
        where: { user: { id: currentUserId }, deleted_at: IsNull() },
      });
      if (!expert) {
        throw new NotFoundException('Expert profile not found for current user');
      }
      createBookingDto.expert_id = expert.id;
    } else if (currentUserRole === 'user' || !currentUserRole) {
      if (!createBookingDto.expert_id) {
        throw new BadRequestException('expert_id is required when booking as a user');
      }
      createBookingDto.client_id = currentUserId;
    } else if (currentUserRole === 'admin') {
      if (!createBookingDto.expert_id) {
        throw new BadRequestException('expert_id is required');
      }
      if (!createBookingDto.client_id) {
        throw new BadRequestException('client_id is required');
      }
    }

    const booking = await this.create(createBookingDto, currentUserId, currentUserRole);

    // Auto-confirm the creator's side
    return await this.confirmBooking(booking.id, currentUserId, currentUserRole);
  }

  async findAll(currentUserId: string, currentUserRole?: string): Promise<Booking[]> {
    const whereClause =
      currentUserRole === 'admin'
        ? { deleted_at: IsNull() }
        : currentUserRole === 'expert'
          ? { deleted_at: IsNull(), expert: { user: { id: currentUserId } } }
          : { deleted_at: IsNull(), client: { id: currentUserId } };

    return await this.bookingRepository.find({
      where: whereClause,
      relations: ['expert', 'expert.user', 'client', 'consultation'],
      order: { created_at: 'DESC' },
    });
  }

  async findPending(currentUserId: string, currentUserRole?: string): Promise<Booking[]> {
    const baseWhere =
      currentUserRole === 'admin'
        ? { deleted_at: IsNull() }
        : currentUserRole === 'expert'
          ? { deleted_at: IsNull(), expert: { user: { id: currentUserId } } }
          : { deleted_at: IsNull(), client: { id: currentUserId } };

    return await this.bookingRepository.find({
      where: {
        ...baseWhere,
        confirmed_by: Not(BookingConfirmationStatus.BOTH),
      },
      relations: ['expert', 'expert.user', 'client', 'consultation'],
      order: { created_at: 'DESC' },
    });
  }

  async findVerified(currentUserId: string, currentUserRole?: string): Promise<Booking[]> {
    const baseWhere =
      currentUserRole === 'admin'
        ? { deleted_at: IsNull() }
        : currentUserRole === 'expert'
          ? { deleted_at: IsNull(), expert: { user: { id: currentUserId } } }
          : { deleted_at: IsNull(), client: { id: currentUserId } };

    return await this.bookingRepository.find({
      where: {
        ...baseWhere,
        confirmed_by: BookingConfirmationStatus.BOTH,
        status: BookingStatus.CONFIRMED,
      },
      relations: ['expert', 'expert.user', 'client', 'consultation'],
      order: { created_at: 'DESC' },
    });
  }

  async findDenied(currentUserId: string, currentUserRole?: string): Promise<Booking[]> {
    const baseWhere =
      currentUserRole === 'admin'
        ? { deleted_at: IsNull() }
        : currentUserRole === 'expert'
          ? { deleted_at: IsNull(), expert: { user: { id: currentUserId } } }
          : { deleted_at: IsNull(), client: { id: currentUserId } };

    return await this.bookingRepository.find({
      where: {
        ...baseWhere,
        status: BookingStatus.CANCELLED,
      },
      relations: ['expert', 'expert.user', 'client', 'consultation'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, currentUserId?: string, currentUserRole?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['expert', 'expert.user', 'client', 'consultation'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (currentUserId) {
      this.ensureOwnership(booking, currentUserId, currentUserRole);
    }

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    currentUserId: string,
    currentUserRole?: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id, currentUserId, currentUserRole);

    if (updateBookingDto.expert_id) {
      const expert = await this.expertRepository.findOne({
        where: { id: updateBookingDto.expert_id, deleted_at: IsNull() },
        relations: ['user'],
      });
      if (!expert) {
        throw new NotFoundException('Expert not found');
      }
      booking.expert = expert;
    }

    if (updateBookingDto.client_id) {
      if (currentUserRole !== 'admin' && updateBookingDto.client_id !== currentUserId) {
        throw new ForbiddenException('You cannot transfer booking ownership to another user');
      }

      const client = await this.userRepository.findOne({
        where: { id: updateBookingDto.client_id, deactivated_at: IsNull() },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      booking.client = client;
    }

    if (updateBookingDto.status !== undefined) {
      if (currentUserRole !== 'admin' && currentUserRole !== 'expert') {
        throw new ForbiddenException('Only expert or admin can change booking status');
      }
      if (currentUserRole === 'expert' && booking.expert?.user?.id !== currentUserId) {
        throw new ForbiddenException('You can only confirm bookings assigned to you');
      }
      booking.status = updateBookingDto.status;
    }

    if (updateBookingDto.call_type !== undefined) {
      booking.call_type = updateBookingDto.call_type;
    }
    if (updateBookingDto.client_note !== undefined) {
      booking.client_note = updateBookingDto.client_note ?? null;
    }
    if (updateBookingDto.scheduled_at !== undefined) {
      const scheduledAt = new Date(updateBookingDto.scheduled_at);
      this.validateScheduledAt(scheduledAt);
      booking.scheduled_at = scheduledAt;
    }

    await this.validateVideoCapability(booking.expert.id, booking.call_type);
    await this.ensureExpertTimeAvailable(booking.expert.id, booking.scheduled_at, booking.id);

    const saved = await this.bookingRepository.save(booking);
    return await this.findOne(saved.id, currentUserId, currentUserRole);
  }

  async confirmBooking(
    id: string,
    currentUserId: string,
    currentUserRole?: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id, currentUserId, currentUserRole);

    // Update confirmation based on role
    if (currentUserRole === 'expert') {
      if (booking.expert?.user?.id !== currentUserId) {
        throw new ForbiddenException('Only the assigned expert can confirm this booking');
      }
      // Expert confirms: update based on current state
      if (booking.confirmed_by === BookingConfirmationStatus.CLIENT) {
        booking.confirmed_by = BookingConfirmationStatus.BOTH;
        booking.status = BookingStatus.CONFIRMED;
      } else if (booking.confirmed_by === BookingConfirmationStatus.NONE) {
        booking.confirmed_by = BookingConfirmationStatus.EXPERT;
      }
    } else if (currentUserRole === 'user' || !currentUserRole) {
      if (booking.client?.id !== currentUserId) {
        throw new ForbiddenException('Only the booking client can confirm this booking');
      }
      // Client confirms: update based on current state
      if (booking.confirmed_by === BookingConfirmationStatus.EXPERT) {
        booking.confirmed_by = BookingConfirmationStatus.BOTH;
        booking.status = BookingStatus.CONFIRMED;
      } else if (booking.confirmed_by === BookingConfirmationStatus.NONE) {
        booking.confirmed_by = BookingConfirmationStatus.CLIENT;
      }
    } else if (currentUserRole === 'admin') {
      // Admins can confirm fully
      booking.confirmed_by = BookingConfirmationStatus.BOTH;
      booking.status = BookingStatus.CONFIRMED;
    } else {
      throw new ForbiddenException('You cannot confirm bookings');
    }

    const saved = await this.bookingRepository.save(booking);
    return await this.findOne(saved.id, currentUserId, currentUserRole);
  }

  async denyBooking(id: string, currentUserId: string, currentUserRole?: string): Promise<Booking> {
    const booking = await this.findOne(id, currentUserId, currentUserRole);

    // Only allow deny if booking is not yet fully confirmed
    if (booking.status === BookingStatus.CONFIRMED) {
      throw new ConflictException('Cannot deny a confirmed booking');
    }

    // Check permission and deny based on role
    if (currentUserRole === 'expert') {
      if (booking.expert?.user?.id !== currentUserId) {
        throw new ForbiddenException('Only the assigned expert can deny this booking');
      }
    } else if (currentUserRole === 'user' || !currentUserRole) {
      if (booking.client?.id !== currentUserId) {
        throw new ForbiddenException('Only the booking client can deny this booking');
      }
    } else if (currentUserRole !== 'admin') {
      throw new ForbiddenException('You cannot deny bookings');
    }

    // Set status to CANCELLED when denied
    booking.status = BookingStatus.CANCELLED;
    const saved = await this.bookingRepository.save(booking);
    return await this.findOne(saved.id, currentUserId, currentUserRole);
  }

  async remove(id: string, currentUserId: string, currentUserRole?: string): Promise<Booking> {
    const booking = await this.findOne(id, currentUserId, currentUserRole);

    const activeConsultation = await this.consultationRepository.findOne({
      where: { booking: { id }, deleted_at: IsNull() },
    });
    if (activeConsultation) {
      throw new ConflictException('Cannot delete booking linked to an active consultation');
    }

    await this.bookingRepository.softDelete(id);

    const deleted = await this.bookingRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['expert', 'client', 'consultation'],
    });

    return deleted ?? { ...booking, deleted_at: new Date() };
  }
}
