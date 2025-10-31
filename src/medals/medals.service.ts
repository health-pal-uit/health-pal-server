import { Injectable } from '@nestjs/common';
import { CreateMedalDto } from './dto/create-medal.dto';
import { UpdateMedalDto } from './dto/update-medal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medal } from './entities/medal.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesMedalsService } from 'src/challenges_medals/challenges_medals.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MedalsService {
  constructor(
    @InjectRepository(Medal) private medalsRepository: Repository<Medal>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    private challengesMedalsService: ChallengesMedalsService,
    private supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
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

  async findAll(): Promise<Medal[]> {
    return await this.medalsRepository.find({
      relations: { challenges_medals: { challenge: true } },
      where: { deleted_at: IsNull() },
    });
  }

  async findOne(id: string): Promise<Medal | null> {
    return await this.medalsRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateMedalDto: UpdateMedalDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<UpdateResult> {
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
    return await this.medalsRepository.update(id, updateMedalDto);
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.medalsRepository.softDelete(id);
  }
}
