import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Consultation } from './entities/consultation.entity';
import { Booking, BookingStatus } from 'src/bookings/entities/booking.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
  ) {}

  private validateDateRange(startedAt?: Date | null, endedAt?: Date | null): void {
    if (startedAt && Number.isNaN(startedAt.getTime())) {
      throw new BadRequestException('Invalid started_at value');
    }
    if (endedAt && Number.isNaN(endedAt.getTime())) {
      throw new BadRequestException('Invalid ended_at value');
    }
    if (startedAt && endedAt && endedAt < startedAt) {
      throw new BadRequestException('ended_at must be greater than or equal to started_at');
    }
  }

  private ensureOwnership(
    consultation: Consultation,
    currentUserId: string,
    currentUserRole?: string,
  ): void {
    if (currentUserRole === 'admin') {
      return;
    }

    if (currentUserRole === 'expert' && consultation.expert?.user?.id === currentUserId) {
      return;
    }

    if (consultation.booking?.client?.id !== currentUserId) {
      throw new ForbiddenException('You can only access your own consultations');
    }
  }

  async create(
    createConsultationDto: CreateConsultationDto,
    currentUserId: string,
    currentUserRole?: string,
  ): Promise<Consultation> {
    const [booking, expert] = await Promise.all([
      this.bookingRepository.findOne({
        where: { id: createConsultationDto.booking_id, deleted_at: IsNull() },
        relations: ['expert', 'expert.user', 'client'],
      }),
      this.expertRepository.findOne({
        where: { id: createConsultationDto.expert_id, deleted_at: IsNull() },
        relations: ['user'],
      }),
    ]);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (!expert) {
      throw new NotFoundException('Expert not found');
    }
    if (currentUserRole !== 'admin' && currentUserRole !== 'expert') {
      throw new ForbiddenException('Only expert or admin can create consultations');
    }
    if (currentUserRole === 'expert' && expert.user?.id !== currentUserId) {
      throw new ForbiddenException('You can only create consultations for your own expert account');
    }
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new ConflictException('Consultation can only be created from a confirmed booking');
    }
    if (booking.expert?.id !== expert.id) {
      throw new ConflictException('Expert does not match booking expert');
    }

    const existingForBooking = await this.consultationRepository.findOne({
      where: { booking: { id: booking.id }, deleted_at: IsNull() },
    });
    if (existingForBooking) {
      throw new ConflictException('This booking already has an active consultation');
    }

    let chatSession: ChatSession | null = null;
    if (createConsultationDto.chat_session_id) {
      chatSession = await this.chatSessionRepository.findOne({
        where: { id: createConsultationDto.chat_session_id, deleted_at: IsNull() },
      });
      if (!chatSession) {
        throw new NotFoundException('Chat session not found');
      }
    }

    const startedAt =
      createConsultationDto.started_at !== undefined
        ? new Date(createConsultationDto.started_at)
        : null;
    const endedAt =
      createConsultationDto.ended_at !== undefined
        ? new Date(createConsultationDto.ended_at)
        : null;
    this.validateDateRange(startedAt, endedAt);

    const consultation = this.consultationRepository.create({
      booking,
      expert,
      chat_session: chatSession,
      status: createConsultationDto.status,
      started_at: startedAt,
      ended_at: endedAt,
      duration_minutes: createConsultationDto.duration_minutes,
      tokens_charged: createConsultationDto.tokens_charged,
    });

    const saved = await this.consultationRepository.save(consultation);
    return await this.findOne(saved.id, currentUserId, currentUserRole);
  }

  async findAll(currentUserId: string, currentUserRole?: string): Promise<Consultation[]> {
    const whereClause =
      currentUserRole === 'admin'
        ? { deleted_at: IsNull() }
        : currentUserRole === 'expert'
          ? { deleted_at: IsNull(), expert: { user: { id: currentUserId } } }
          : { deleted_at: IsNull(), booking: { client: { id: currentUserId } } };

    return await this.consultationRepository.find({
      where: whereClause,
      relations: ['booking', 'expert', 'chat_session', 'expert_rating'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(
    id: string,
    currentUserId?: string,
    currentUserRole?: string,
  ): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: [
        'booking',
        'booking.expert',
        'booking.client',
        'expert',
        'expert.user',
        'chat_session',
        'expert_rating',
      ],
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (currentUserId) {
      this.ensureOwnership(consultation, currentUserId, currentUserRole);
    }

    return consultation;
  }

  async update(
    id: string,
    updateConsultationDto: UpdateConsultationDto,
    currentUserId: string,
    currentUserRole?: string,
  ): Promise<Consultation> {
    const consultation = await this.findOne(id, currentUserId, currentUserRole);

    if (currentUserRole !== 'admin' && currentUserRole !== 'expert') {
      throw new ForbiddenException('Only expert or admin can update consultations');
    }
    if (currentUserRole === 'expert' && consultation.expert?.user?.id !== currentUserId) {
      throw new ForbiddenException('You can only update consultations assigned to you');
    }

    if (updateConsultationDto.booking_id) {
      const booking = await this.bookingRepository.findOne({
        where: { id: updateConsultationDto.booking_id, deleted_at: IsNull() },
        relations: ['expert', 'client'],
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (currentUserRole !== 'admin' && booking.client?.id !== currentUserId) {
        throw new ForbiddenException('You can only reassign to your own booking');
      }

      const existingForBooking = await this.consultationRepository.findOne({
        where: { booking: { id: booking.id }, deleted_at: IsNull() },
      });
      if (existingForBooking && existingForBooking.id !== consultation.id) {
        throw new ConflictException('This booking already has an active consultation');
      }

      consultation.booking = booking;
    }

    if (updateConsultationDto.expert_id) {
      const expert = await this.expertRepository.findOne({
        where: { id: updateConsultationDto.expert_id, deleted_at: IsNull() },
      });
      if (!expert) {
        throw new NotFoundException('Expert not found');
      }
      consultation.expert = expert;
    }

    if (consultation.booking?.expert?.id && consultation.expert?.id) {
      if (consultation.booking.expert.id !== consultation.expert.id) {
        throw new ConflictException('Expert does not match booking expert');
      }
    }

    if (updateConsultationDto.chat_session_id !== undefined) {
      if (updateConsultationDto.chat_session_id === null) {
        consultation.chat_session = null;
      } else {
        const chatSession = await this.chatSessionRepository.findOne({
          where: { id: updateConsultationDto.chat_session_id, deleted_at: IsNull() },
        });
        if (!chatSession) {
          throw new NotFoundException('Chat session not found');
        }
        consultation.chat_session = chatSession;
      }
    }

    if (updateConsultationDto.status !== undefined) {
      consultation.status = updateConsultationDto.status;
    }
    if (updateConsultationDto.duration_minutes !== undefined) {
      consultation.duration_minutes = updateConsultationDto.duration_minutes;
    }
    if (updateConsultationDto.tokens_charged !== undefined) {
      consultation.tokens_charged = updateConsultationDto.tokens_charged;
    }

    if (updateConsultationDto.started_at !== undefined) {
      consultation.started_at = updateConsultationDto.started_at
        ? new Date(updateConsultationDto.started_at)
        : null;
    }
    if (updateConsultationDto.ended_at !== undefined) {
      consultation.ended_at = updateConsultationDto.ended_at
        ? new Date(updateConsultationDto.ended_at)
        : null;
    }
    this.validateDateRange(consultation.started_at, consultation.ended_at);

    const saved = await this.consultationRepository.save(consultation);
    return await this.findOne(saved.id, currentUserId, currentUserRole);
  }

  async remove(id: string, currentUserId: string, currentUserRole?: string): Promise<Consultation> {
    const consultation = await this.findOne(id, currentUserId, currentUserRole);

    if (currentUserRole !== 'admin' && currentUserRole !== 'expert') {
      throw new ForbiddenException('Only expert or admin can delete consultations');
    }
    if (currentUserRole === 'expert' && consultation.expert?.user?.id !== currentUserId) {
      throw new ForbiddenException('You can only delete consultations assigned to you');
    }

    await this.consultationRepository.softDelete(id);

    const deleted = await this.consultationRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['booking', 'expert', 'chat_session', 'expert_rating'],
    });

    return deleted ?? { ...consultation, deleted_at: new Date() };
  }
}
