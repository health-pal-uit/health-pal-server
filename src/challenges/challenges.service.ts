import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { CreateChallengeWithRecordsDto } from './dto/create-challenge-with-records.dto';
import { UpdateChallengeWithRecordsDto } from './dto/update-challenge-with-records.dto';
import { Challenge } from './entities/challenge.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ActivityRecordsService } from 'src/activity_records/activity_records.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';
import { ChallengesUser } from 'src/challenges_users/entities/challenges_user.entity';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    @InjectRepository(ChallengesUser) private challengesUserRepository: Repository<ChallengesUser>,
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
      relations: { activity_records: { activity: true } },
    });
    if (!foundChallenge) {
      throw new NotFoundException('Challenge not found after creation');
    }
    return foundChallenge;
  }

  // create challenge with new activity records
  async createWithRecords(
    createDto: CreateChallengeWithRecordsDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Challenge> {
    // upload image if provided
    if (imageBuffer && imageName) {
      const challengeImgBucketName =
        this.configService.get<string>('CHALLENGE_IMG_BUCKET_NAME') || 'challenge-imgs';
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        challengeImgBucketName,
      );
      if (imageUrl) {
        createDto.image_url = imageUrl;
      }
    }

    // create challenge
    const challenge = this.challengesRepository.create({
      name: createDto.name,
      note: createDto.note,
      image_url: createDto.image_url,
      difficulty: createDto.difficulty,
    });
    const savedChallenge = await this.challengesRepository.save(challenge);

    // create activity records for this challenge
    for (const arDto of createDto.activity_records) {
      arDto.challenge_id = savedChallenge.id;
      await this.activityRecordsService.createChallenges(arDto);
    }

    // return challenge with activity records
    const foundChallenge = await this.challengesRepository.findOne({
      where: { id: savedChallenge.id },
      relations: { activity_records: { activity: true } },
    });
    if (!foundChallenge) {
      throw new NotFoundException('Challenge not found after creation');
    }
    return foundChallenge;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Challenge[]> {
    const skip = (page - 1) * limit;
    return await this.challengesRepository.find({
      where: { deleted_at: IsNull() },
      relations: { activity_records: { activity: true } },
      skip,
      take: limit,
    });
  }

  // get all challenges with progress for user
  async findAllWithProgress(userId: string, page: number = 1, limit: number = 10): Promise<any[]> {
    const skip = (page - 1) * limit;
    const challenges = await this.challengesRepository.find({
      where: { deleted_at: IsNull() },
      relations: { activity_records: { activity: true } },
      skip,
      take: limit,
    });

    // calculate progress for each challenge
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        const userChallenge = await this.challengesUserRepository.findOne({
          where: { challenge: { id: challenge.id }, user: { id: userId } },
        });
        const is_finished = userChallenge?.completed_at ? true : false;
        const progress_percent =
          await this.activityRecordsService.recalculateProgressChallengesForUser(
            challenge.id,
            userId,
          );
        const can_claim = progress_percent === 100 && !is_finished;
        return {
          ...challenge,
          is_finished,
          progress_percent,
          can_claim,
        };
      }),
    );

    return challengesWithProgress;
  }

  async findOne(id: string): Promise<Challenge> {
    const challenge = await this.challengesRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: { activity_records: { activity: true } },
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

  // update challenge and add new activity records
  async updateWithRecords(
    id: string,
    updateDto: UpdateChallengeWithRecordsDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Challenge> {
    // verify challenge exists
    await this.findOne(id);

    // upload image if provided
    if (imageBuffer && imageName) {
      const challengeImgBucketName =
        this.configService.get<string>('CHALLENGE_IMG_BUCKET_NAME') || 'challenge-imgs';
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        challengeImgBucketName,
      );
      if (imageUrl) {
        updateDto.image_url = imageUrl;
      }
    }

    // update challenge properties
    const updateData: any = {};
    if (updateDto.name) updateData.name = updateDto.name;
    if (updateDto.difficulty) updateData.difficulty = updateDto.difficulty;
    if (updateDto.note) updateData.note = updateDto.note;
    if (updateDto.image_url) updateData.image_url = updateDto.image_url;

    if (Object.keys(updateData).length > 0) {
      await this.challengesRepository.update(id, updateData);
    }

    // add new activity records if provided
    if (updateDto.activity_records && updateDto.activity_records.length > 0) {
      for (const arDto of updateDto.activity_records) {
        arDto.challenge_id = id;
        await this.activityRecordsService.createChallenges(arDto);
      }
    }

    // return updated challenge with activity records
    return this.findOne(id);
  }

  async remove(id: string): Promise<Challenge> {
    const challenge = await this.findOne(id);
    await this.challengesRepository.softDelete(id);
    return challenge;
  }
}
