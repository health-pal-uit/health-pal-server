import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ActivityRecordsService } from 'src/activity_records/activity_records.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    private activityRecordsService: ActivityRecordsService,
    private supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
  ) {}
  async create(
    createChallengeDto: CreateChallengeDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Challenge> {
    if (imageBuffer && imageName) {
      const challengeImgBucketName =
        this.configService.get<string>('CHALLENGE_IMG_BUCKET_NAME') || 'challenge-imgs';
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        challengeImgBucketName,
      );
      createChallengeDto.image_url = imageUrl || createChallengeDto.image_url;
    }
    const challenge = this.challengesRepository.create(createChallengeDto);
    const savedChallenge = await this.challengesRepository.save(challenge);
    if (createChallengeDto.activity_records_ids) {
      for (const id of createChallengeDto.activity_records_ids) {
        await this.activityRecordsService.assignToChallenge(id, savedChallenge.id);
      }
    }
    const foundChallenge = await this.challengesRepository.findOne({
      where: { id: savedChallenge.id },
      relations: ['activity_records'],
    });
    if (!foundChallenge) {
      throw new NotFoundException('Challenge not found after creation');
    }
    return foundChallenge;
  }

  async findAll(): Promise<Challenge[]> {
    return await this.challengesRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['activity_records'],
    });
  }

  async findOne(id: string): Promise<Challenge> {
    const challenge = await this.challengesRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['activity_records'],
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with id ${id} not found`);
    }
    return challenge;
  }

  async update(
    id: string,
    updateChallengeDto: UpdateChallengeDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Challenge> {
    // Verify challenge exists and is not soft-deleted
    await this.findOne(id);

    if (imageBuffer && imageName) {
      const challengeImgBucketName =
        this.configService.get<string>('CHALLENGE_IMG_BUCKET_NAME') || 'challenge-imgs';
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        challengeImgBucketName,
      );
      updateChallengeDto.image_url = imageUrl || updateChallengeDto.image_url;
    }
    await this.challengesRepository.update(id, updateChallengeDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<Challenge> {
    const challenge = await this.findOne(id);
    await this.challengesRepository.softDelete(id);
    return challenge;
  }
}
