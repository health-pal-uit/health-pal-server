import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateChallengesMedalDto } from './dto/create-challenges_medal.dto';
import { UpdateChallengesMedalDto } from './dto/update-challenges_medal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChallengesMedal } from './entities/challenges_medal.entity';
import { IsNull, Repository } from 'typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';

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

    if (!medal || !challenge) {
      throw new NotFoundException('Medal or Challenge not found');
    }

    // Check if assignment already exists
    const existing = await this.challengesMedalRepository.findOne({
      where: {
        medal: { id: createChallengesMedalDto.medal_id },
        challenge: { id: createChallengesMedalDto.challenge_id },
      },
    });

    if (existing) {
      throw new ConflictException('Medal already assigned to this challenge');
    }

    const challengesMedal = this.challengesMedalRepository.create({
      medal,
      challenge,
    });
    return this.challengesMedalRepository.save(challengesMedal);
  }

  async findAll(): Promise<ChallengesMedal[]> {
    return await this.challengesMedalRepository.find({
      relations: ['challenge', 'medal'],
    });
  }

  async findOne(id: string): Promise<ChallengesMedal> {
    const challengesMedal = await this.challengesMedalRepository.findOne({
      where: { id },
      relations: ['challenge', 'medal'],
    });
    if (!challengesMedal) {
      throw new NotFoundException(`ChallengesMedal with id ${id} not found`);
    }
    return challengesMedal;
  }

  async update(
    id: string,
    updateChallengesMedalDto: UpdateChallengesMedalDto,
  ): Promise<ChallengesMedal> {
    // Verify the assignment exists
    const existingAssignment = await this.findOne(id);

    // Validate new medal exists if provided
    if (updateChallengesMedalDto.medal_id) {
      const medal = await this.medalsRepository.findOne({
        where: { id: updateChallengesMedalDto.medal_id, deleted_at: IsNull() },
      });
      if (!medal) {
        throw new NotFoundException('Medal not found');
      }
      existingAssignment.medal = medal;
    }

    // Validate new challenge exists if provided
    if (updateChallengesMedalDto.challenge_id) {
      const challenge = await this.challengesRepository.findOne({
        where: { id: updateChallengesMedalDto.challenge_id, deleted_at: IsNull() },
      });
      if (!challenge) {
        throw new NotFoundException('Challenge not found');
      }
      existingAssignment.challenge = challenge;
    }

    // Check for duplicate if either medal or challenge changed
    if (updateChallengesMedalDto.medal_id || updateChallengesMedalDto.challenge_id) {
      const duplicate = await this.challengesMedalRepository.findOne({
        where: {
          medal: { id: existingAssignment.medal.id },
          challenge: { id: existingAssignment.challenge.id },
        },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Medal already assigned to this challenge');
      }
    }

    return await this.challengesMedalRepository.save(existingAssignment);
  }

  async remove(id: string): Promise<ChallengesMedal> {
    const challengesMedal = await this.findOne(id);
    await this.challengesMedalRepository.delete(id);
    return challengesMedal;
  }
}
