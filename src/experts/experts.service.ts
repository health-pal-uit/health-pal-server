import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Expert } from './entities/expert.entity';
import { User } from 'src/users/entities/user.entity';
import { ExpertRole } from 'src/expert_roles/entities/expert_role.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';
import { CreateCurrentExpertDto } from './dto/create-current-expert.dto';
import { Role } from 'src/roles/entities/role.entity';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExpertsService {
  constructor(
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ExpertRole)
    private readonly expertRoleRepository: Repository<ExpertRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PremiumPackage)
    private readonly premiumPackageRepository: Repository<PremiumPackage>,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
  ) {}

  async create(createExpertDto: CreateExpertDto): Promise<Expert> {
    const [user, expertRole, bookingFeeTier] = await Promise.all([
      this.userRepository.findOne({
        where: { id: createExpertDto.user_id, deactivated_at: IsNull() },
        relations: ['role'],
      }),
      this.expertRoleRepository.findOne({
        where: { id: createExpertDto.expert_role_id, deleted_at: IsNull() },
      }),
      createExpertDto.booking_fee_tier_id
        ? this.premiumPackageRepository.findOne({
            where: { id: createExpertDto.booking_fee_tier_id, deleted_at: IsNull() },
          })
        : Promise.resolve(null),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!expertRole) {
      throw new NotFoundException('Expert role not found');
    }

    if (createExpertDto.booking_fee_tier_id && !bookingFeeTier) {
      throw new NotFoundException('Premium package tier not found');
    }

    const existing = await this.expertRepository.findOne({
      where: {
        user: { id: createExpertDto.user_id },
        deleted_at: IsNull(),
      },
      relations: ['user'],
    });

    if (existing) {
      throw new ConflictException('This user is already registered as an expert');
    }

    const expert = this.expertRepository.create({
      bio: createExpertDto.bio ?? null,
      token_per_minute: createExpertDto.token_per_minute ?? 0,
      license_id: createExpertDto.license_id,
      license_url: createExpertDto.license_url,
      is_verified: false,
      booking_fee_tier: bookingFeeTier ?? null,
      rating_avg: createExpertDto.rating_avg ?? 0,
      rating_count: createExpertDto.rating_count ?? 0,
      user,
      expert_role: expertRole,
    });

    const saved = await this.expertRepository.save(expert);
    return await this.findOne(saved.id);
  }

  async createCurrentExpert(
    currentUserId: string,
    dto: CreateCurrentExpertDto,
    licenseBuffer: Buffer,
    licenseFileName: string,
  ): Promise<Expert> {
    const licensesBucketName = this.configService.get<string>('LICENSES_BUCKET_NAME') || 'licenses';
    const licenseUrl = await this.supabaseStorageService.uploadImageFromBuffer(
      licenseBuffer,
      licenseFileName,
      licensesBucketName,
    );

    if (!licenseUrl) {
      throw new BadRequestException('Failed to upload license photo');
    }

    return await this.create({
      ...dto,
      user_id: currentUserId,
      license_url: licenseUrl,
    });
  }

  async findAll(): Promise<Expert[]> {
    return await this.expertRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['user', 'expert_role', 'booking_fee_tier'],
      order: { created_at: 'DESC' },
    });
  }

  async findAllForAdminReview(): Promise<{
    verified: Expert[];
    unverified: Expert[];
    total_verified: number;
    total_unverified: number;
  }> {
    const [verified, unverified] = await Promise.all([
      this.expertRepository.find({
        where: { deleted_at: IsNull(), is_verified: true },
        relations: ['user', 'expert_role', 'booking_fee_tier'],
        order: { created_at: 'DESC' },
      }),
      this.expertRepository.find({
        where: { deleted_at: IsNull(), is_verified: false },
        relations: ['user', 'expert_role', 'booking_fee_tier'],
        order: { created_at: 'DESC' },
      }),
    ]);

    return {
      verified,
      unverified,
      total_verified: verified.length,
      total_unverified: unverified.length,
    };
  }

  async findOne(id: string): Promise<Expert> {
    const expert = await this.expertRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['user', 'expert_role', 'booking_fee_tier'],
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    return expert;
  }

  async update(id: string, updateExpertDto: UpdateExpertDto): Promise<Expert> {
    const expert = await this.findOne(id);

    if (updateExpertDto.user_id && updateExpertDto.user_id !== expert.user.id) {
      const user = await this.userRepository.findOne({
        where: { id: updateExpertDto.user_id, deactivated_at: IsNull() },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userAlreadyUsed = await this.expertRepository.findOne({
        where: {
          user: { id: updateExpertDto.user_id },
          deleted_at: IsNull(),
        },
        relations: ['user'],
      });

      if (userAlreadyUsed && userAlreadyUsed.id !== id) {
        throw new ConflictException('This user is already registered as an expert');
      }

      expert.user = user;
    }

    if (updateExpertDto.expert_role_id) {
      const expertRole = await this.expertRoleRepository.findOne({
        where: { id: updateExpertDto.expert_role_id, deleted_at: IsNull() },
      });

      if (!expertRole) {
        throw new NotFoundException('Expert role not found');
      }

      expert.expert_role = expertRole;
    }

    if (updateExpertDto.booking_fee_tier_id) {
      const bookingFeeTier = await this.premiumPackageRepository.findOne({
        where: { id: updateExpertDto.booking_fee_tier_id, deleted_at: IsNull() },
      });

      if (!bookingFeeTier) {
        throw new NotFoundException('Premium package tier not found');
      }

      expert.booking_fee_tier = bookingFeeTier;
    }

    if (updateExpertDto.rating_avg !== undefined && updateExpertDto.rating_avg < 0) {
      throw new BadRequestException('rating_avg must be greater than or equal to 0');
    }

    if (updateExpertDto.rating_count !== undefined && updateExpertDto.rating_count < 0) {
      throw new BadRequestException('rating_count must be greater than or equal to 0');
    }

    if (updateExpertDto.token_per_minute !== undefined && updateExpertDto.token_per_minute < 0) {
      throw new BadRequestException('token_per_minute must be greater than or equal to 0');
    }

    if (updateExpertDto.bio !== undefined) {
      expert.bio = updateExpertDto.bio ?? null;
    }
    if (updateExpertDto.license_id !== undefined) {
      expert.license_id = updateExpertDto.license_id;
    }
    if (updateExpertDto.license_url !== undefined) {
      expert.license_url = updateExpertDto.license_url;
    }
    if (updateExpertDto.token_per_minute !== undefined) {
      expert.token_per_minute = updateExpertDto.token_per_minute;
    }
    if (updateExpertDto.is_verified !== undefined) {
      expert.is_verified = updateExpertDto.is_verified;
    }
    if (updateExpertDto.rating_avg !== undefined) {
      expert.rating_avg = updateExpertDto.rating_avg;
    }
    if (updateExpertDto.rating_count !== undefined) {
      expert.rating_count = updateExpertDto.rating_count;
    }

    await this.expertRepository.save(expert);
    return await this.findOne(id);
  }

  async verifyExpert(id: string, isVerified = true): Promise<Expert> {
    const expert = await this.findOne(id);

    expert.is_verified = isVerified;
    await this.expertRepository.save(expert);

    if (isVerified) {
      const expertRole = await this.roleRepository.findOne({ where: { name: 'expert' } });
      if (!expertRole) {
        throw new NotFoundException('Role expert not found');
      }

      expert.user.role = expertRole;
      await this.userRepository.save(expert.user);
    }

    return await this.findOne(id);
  }

  async remove(id: string): Promise<Expert> {
    const expert = await this.findOne(id);
    await this.expertRepository.softDelete(id);

    const deleted = await this.expertRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['user', 'expert_role'],
    });

    return deleted ?? { ...expert, deleted_at: new Date() };
  }
}
