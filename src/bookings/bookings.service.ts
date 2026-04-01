import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Booking, BookingCallType, BookingStatus } from './entities/booking.entity';
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
