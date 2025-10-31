import { Injectable } from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, UpdateResult } from 'typeorm';
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
    if (!foundChallenge) throw new Error('Sth wrong');
    return foundChallenge;
  }

  async findAll(): Promise<Challenge[]> {
    return await this.challengesRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['activity_records'],
    });
  }

  async findOne(id: string): Promise<Challenge | null> {
    return await this.challengesRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateChallengeDto: UpdateChallengeDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<UpdateResult> {
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
    return await this.challengesRepository.update(id, updateChallengeDto);
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.challengesRepository.softDelete(id);
  }
}
