import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpertRatingDto } from './dto/create-expert_rating.dto';
import { UpdateExpertRatingDto } from './dto/update-expert_rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ExpertRating } from './entities/expert_rating.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { User } from 'src/users/entities/user.entity';
import { Consultation } from 'src/consultations/entities/consultation.entity';
import { ConsultationStatus } from 'src/consultations/entities/consultation.entity';

@Injectable()
export class ExpertRatingsService {
  constructor(
    @InjectRepository(ExpertRating)
    private readonly expertRatingRepository: Repository<ExpertRating>,
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
  ) {}

  private async recalculateExpertStats(expertId: string): Promise<void> {
    const ratings = await this.expertRatingRepository.find({
      where: { expert: { id: expertId } },
      select: { id: true, score: true },
    });

    const ratingCount = ratings.length;
    const ratingAvg =
      ratingCount === 0 ? 0 : ratings.reduce((sum, rating) => sum + rating.score, 0) / ratingCount;

    await this.expertRepository.update(expertId, {
      rating_count: ratingCount,
      rating_avg: Number(ratingAvg.toFixed(2)),
    });
  }

  async create(
    createExpertRatingDto: CreateExpertRatingDto,
    currentUserId: string,
    currentUserRole?: string,
  ): Promise<ExpertRating> {
    const effectiveClientId =
      currentUserRole === 'admin' ? createExpertRatingDto.client_id : currentUserId;

    if (currentUserRole !== 'admin' && createExpertRatingDto.client_id !== currentUserId) {
      throw new ForbiddenException('You can only create ratings as the authenticated client');
    }

    const [expert, client, consultation] = await Promise.all([
      this.expertRepository.findOne({
        where: { id: createExpertRatingDto.expert_id, deleted_at: IsNull() },
      }),
      this.userRepository.findOne({
        where: { id: effectiveClientId, deactivated_at: IsNull() },
      }),
      this.consultationRepository.findOne({
        where: { id: createExpertRatingDto.consultation_id, deleted_at: IsNull() },
        relations: ['expert', 'booking', 'booking.client', 'expert_rating'],
      }),
    ]);

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.status !== ConsultationStatus.COMPLETED) {
      throw new ConflictException('Expert can only be rated after consultation is completed');
    }
    if (consultation.expert_rating) {
      throw new ConflictException('This consultation already has a rating');
    }
    if (consultation.expert?.id !== expert.id) {
      throw new ConflictException('Expert does not match consultation expert');
    }
    if (consultation.booking?.client?.id && consultation.booking.client.id !== client.id) {
      throw new ConflictException('Client does not match consultation client');
    }

    const rating = this.expertRatingRepository.create({
      score: createExpertRatingDto.score,
      comment: createExpertRatingDto.comment ?? null,
      expert,
      client,
      consultation,
    });

    const saved = await this.expertRatingRepository.save(rating);
    await this.recalculateExpertStats(expert.id);
    return await this.findOne(saved.id);
  }

  async findAll(): Promise<ExpertRating[]> {
    return await this.expertRatingRepository.find({
      relations: ['expert', 'client', 'consultation'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ExpertRating> {
    const rating = await this.expertRatingRepository.findOne({
      where: { id },
      relations: ['expert', 'client', 'consultation'],
    });

    if (!rating) {
      throw new NotFoundException('Expert rating not found');
    }

    return rating;
  }

  async update(id: string, updateExpertRatingDto: UpdateExpertRatingDto): Promise<ExpertRating> {
    const rating = await this.expertRatingRepository.findOne({
      where: { id },
      relations: [
        'expert',
        'client',
        'consultation',
        'consultation.booking',
        'consultation.booking.client',
      ],
    });

    if (!rating) {
      throw new NotFoundException('Expert rating not found');
    }

    const oldExpertId = rating.expert.id;

    if (updateExpertRatingDto.expert_id) {
      const expert = await this.expertRepository.findOne({
        where: { id: updateExpertRatingDto.expert_id, deleted_at: IsNull() },
      });
      if (!expert) {
        throw new NotFoundException('Expert not found');
      }
      rating.expert = expert;
    }

    if (updateExpertRatingDto.client_id) {
      const client = await this.userRepository.findOne({
        where: { id: updateExpertRatingDto.client_id, deactivated_at: IsNull() },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      rating.client = client;
    }

    if (updateExpertRatingDto.consultation_id) {
      const consultation = await this.consultationRepository.findOne({
        where: { id: updateExpertRatingDto.consultation_id, deleted_at: IsNull() },
        relations: ['expert', 'booking', 'booking.client', 'expert_rating'],
      });
      if (!consultation) {
        throw new NotFoundException('Consultation not found');
      }
      if (consultation.expert_rating && consultation.expert_rating.id !== rating.id) {
        throw new ConflictException('This consultation already has a rating');
      }
      rating.consultation = consultation;
    }

    if (rating.consultation.expert?.id !== rating.expert.id) {
      throw new ConflictException('Expert does not match consultation expert');
    }
    if (
      rating.consultation.booking?.client?.id &&
      rating.consultation.booking.client.id !== rating.client.id
    ) {
      throw new ConflictException('Client does not match consultation client');
    }

    if (updateExpertRatingDto.score !== undefined) {
      rating.score = updateExpertRatingDto.score;
    }
    if (updateExpertRatingDto.comment !== undefined) {
      rating.comment = updateExpertRatingDto.comment ?? null;
    }

    const saved = await this.expertRatingRepository.save(rating);
    await this.recalculateExpertStats(oldExpertId);
    if (saved.expert.id !== oldExpertId) {
      await this.recalculateExpertStats(saved.expert.id);
    }

    return await this.findOne(saved.id);
  }

  async remove(id: string): Promise<ExpertRating> {
    const rating = await this.findOne(id);
    await this.expertRatingRepository.delete(id);
    await this.recalculateExpertStats(rating.expert.id);
    return rating;
  }
}
