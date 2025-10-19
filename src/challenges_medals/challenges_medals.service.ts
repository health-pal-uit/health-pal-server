import { Inject, Injectable } from '@nestjs/common';
import { CreateChallengesMedalDto } from './dto/create-challenges_medal.dto';
import { UpdateChallengesMedalDto } from './dto/update-challenges_medal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChallengesMedal } from './entities/challenges_medal.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { ChallengesUsersService } from 'src/challenges_users/challenges_users.service';

@Injectable()
export class ChallengesMedalsService {
  constructor(
    @InjectRepository(ChallengesMedal)
    private challengesMedalRepository: Repository<ChallengesMedal>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    @InjectRepository(Medal) private medalsRepository: Repository<Medal>,
  ) {}

  async create(createChallengesMedalDto: CreateChallengesMedalDto): Promise<ChallengesMedal> {
    const medal = await this.medalsRepository.findOne({
      where: { id: createChallengesMedalDto.medal_id, deleted_at: IsNull() },
    });
    const challenge = await this.challengesRepository.findOne({
      where: { id: createChallengesMedalDto.challenge_id, deleted_at: IsNull() },
    });
    const challengesMedal = this.challengesMedalRepository.create();
    if (!medal || !challenge) {
      throw new Error('Medal or Challenge not found');
    }
    challengesMedal.medal = medal;
    challengesMedal.challenge = challenge;
    return this.challengesMedalRepository.save(challengesMedal);
  }

  findAll() {
    return `This action returns all challengesMedals`;
  }

  findOne(id: string) {
    return `This action returns a #${id} challengesMedal`;
  }

  async update(
    id: string,
    updateChallengesMedalDto: UpdateChallengesMedalDto,
  ): Promise<UpdateResult> {
    const medal = await this.medalsRepository.findOne({
      where: { id: updateChallengesMedalDto.medal_id },
    });
    const challenge_medals = await this.challengesMedalRepository.find({
      where: { challenge: { id: updateChallengesMedalDto.challenge_id, deleted_at: IsNull() } },
    });
    if (challenge_medals.length > 0) {
      challenge_medals.forEach(async (cm) => {
        await this.challengesMedalRepository.delete(cm.id);
      });
    }
    const challenge = await this.challengesRepository.findOne({
      where: { id: updateChallengesMedalDto.challenge_id },
    });
    if (!medal || !challenge) {
      throw new Error('Medal or Challenge not found');
    }
    const challengesMedal = this.challengesMedalRepository.create();
    challengesMedal.medal = medal;
    challengesMedal.challenge = challenge;
    await this.challengesMedalRepository.save(challengesMedal);
    return this.challengesMedalRepository.update(id, {});
  }

  async remove(id: string) {
    return `This action removes a #${id} challengesMedal`;
  }
}
