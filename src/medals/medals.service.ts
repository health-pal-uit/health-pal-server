import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { CreateMedalDto } from './dto/create-medal.dto';
import { UpdateMedalDto } from './dto/update-medal.dto';
import { CreateMedalWithChallengesDto } from './dto/create-medal-with-challenges.dto';
import { UpdateMedalWithChallengesDto } from './dto/update-medal-with-challenges.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medal } from './entities/medal.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesMedalsService } from 'src/challenges_medals/challenges_medals.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';
import { ChallengesService } from 'src/challenges/challenges.service';

@Injectable()
export class MedalsService {
  constructor(
    @InjectRepository(Medal) private medalsRepository: Repository<Medal>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    private challengesMedalsService: ChallengesMedalsService,
    private supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ChallengesService))
    private challengesService: ChallengesService,
  ) {}

  async create(
    createMedalDto: CreateMedalDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Medal> {
    if (imageBuffer && imageName) {
      const medalImgBucketName =
        this.configService.get<string>('MEDAL_IMG_BUCKET_NAME') || 'medal-imgs';
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        medalImgBucketName,
      );
      createMedalDto.image_url = imageUrl || createMedalDto.image_url;
    }
    const medal = this.medalsRepository.create(createMedalDto);
    const challenges = await this.challengesRepository.findByIds(
      createMedalDto.challenge_ids || [],
    );
    for (const challenge of challenges) {
      await this.challengesMedalsService.create({
        challenge_id: challenge.id,
        medal_id: medal.id,
      });
    }
    return await this.medalsRepository.save(medal);
  }

  // create medal with new challenges and their activity records
  async createWithChallenges(
    createDto: CreateMedalWithChallengesDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Medal> {
    // upload image if provided
    let imageUrl: string | undefined;
    if (imageBuffer && imageName) {
      const medalImgBucketName =
        this.configService.get<string>('MEDAL_IMG_BUCKET_NAME') || 'medal-imgs';
      const uploadedUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        medalImgBucketName,
      );
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    // create medal
    const medal = this.medalsRepository.create({
      name: createDto.name,
      tier: createDto.tier,
      note: createDto.note,
      image_url: imageUrl,
    });
    const savedMedal = await this.medalsRepository.save(medal);

    // create challenges with their activity records
    const challengeIds: string[] = [];
    for (const challengeDto of createDto.challenges) {
      const challenge = await this.challengesService.createWithRecords(challengeDto);
      challengeIds.push(challenge.id);

      // link challenge to medal
      await this.challengesMedalsService.create({
        challenge_id: challenge.id,
        medal_id: savedMedal.id,
      });
    }

    // return medal with challenges
    const foundMedal = await this.medalsRepository.findOne({
      where: { id: savedMedal.id },
      relations: { challenges_medals: { challenge: { activity_records: { activity: true } } } },
    });
    if (!foundMedal) {
      throw new NotFoundException('Medal not found after creation');
    }
    return foundMedal;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Medal[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.medalsRepository.findAndCount({
      relations: { challenges_medals: { challenge: true } },
      where: { deleted_at: IsNull() },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  // get all medals with finished status for user
  async findAllWithProgress(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.medalsRepository.findAndCount({
      relations: { challenges_medals: { challenge: true } },
      where: { deleted_at: IsNull() },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    // check if user has finished each medal and all its challenges
    const medalsWithProgress = await Promise.all(
      data.map(async (medal) => {
        // check if user claimed the medal
        const medalUser = await this.medalsRepository.manager.getRepository('MedalUser').findOne({
          where: { medal_id: medal.id, user_id: userId },
        });

        // check if all challenges in the medal are finished by user
        const challengeIds = medal.challenges_medals.map((cm) => cm.challenge.id);
        let all_challenges_finished = true;

        if (challengeIds.length > 0) {
          const finishedChallenges = await this.medalsRepository.manager
            .getRepository('ChallengeUser')
            .find({
              where: { challenge_id: challengeIds, user_id: userId },
            });
          all_challenges_finished = finishedChallenges.length === challengeIds.length;
        }

        return {
          ...medal,
          is_finished: !!medalUser,
          all_challenges_finished,
          can_claim: !medalUser && all_challenges_finished,
        };
      }),
    );

    return { data: medalsWithProgress, total, page, limit };
  }

  async findOne(id: string): Promise<Medal | null> {
    return await this.medalsRepository.findOne({
      where: { id },
      relations: { challenges_medals: { challenge: { activity_records: { activity: true } } } },
    });
  }

  async update(
    id: string,
    updateMedalDto: UpdateMedalDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Medal | null> {
    if (imageBuffer && imageName) {
      const medalImgBucketName =
        this.configService.get<string>('MEDAL_IMG_BUCKET_NAME') || 'medal-imgs';
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        medalImgBucketName,
      );
      updateMedalDto.image_url = imageUrl || updateMedalDto.image_url;
    }
    const challenges = await this.challengesRepository.findByIds(
      updateMedalDto.challenge_ids || [],
    );
    for (const challenge of challenges) {
      await this.challengesMedalsService.update(id, {
        challenge_id: challenge.id,
        medal_id: id,
      });
    }
    await this.medalsRepository.update(id, updateMedalDto);
    return await this.findOne(id);
  }

  // update medal and add/create new challenges with activity records
  async updateWithChallenges(
    id: string,
    updateDto: UpdateMedalWithChallengesDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Medal | null> {
    // verify medal exists
    const medal = await this.findOne(id);
    if (!medal) {
      throw new NotFoundException(`Medal with id ${id} not found`);
    }

    // upload image if provided
    let imageUrl: string | undefined;
    if (imageBuffer && imageName) {
      const medalImgBucketName =
        this.configService.get<string>('MEDAL_IMG_BUCKET_NAME') || 'medal-imgs';
      const uploadedUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        medalImgBucketName,
      );
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    // update medal properties
    const updateData: any = {};
    if (updateDto.name) updateData.name = updateDto.name;
    if (updateDto.tier) updateData.tier = updateDto.tier;
    if (updateDto.note) updateData.note = updateDto.note;
    if (imageUrl) updateData.image_url = imageUrl;

    if (Object.keys(updateData).length > 0) {
      await this.medalsRepository.update(id, updateData);
    }

    // create and link new challenges if provided
    if (updateDto.challenges && updateDto.challenges.length > 0) {
      for (const challengeDto of updateDto.challenges) {
        const challenge = await this.challengesService.createWithRecords(challengeDto);

        // link challenge to medal
        await this.challengesMedalsService.create({
          challenge_id: challenge.id,
          medal_id: id,
        });
      }
    }

    // return updated medal with challenges
    return await this.findOne(id);
  }

  async remove(id: string): Promise<Medal | null> {
    await this.medalsRepository.softDelete(id);
    return await this.medalsRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['challenges'],
    });
  }
}
