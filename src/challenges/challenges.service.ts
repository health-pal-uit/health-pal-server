import { Injectable } from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { ActivityRecordsService } from 'src/activity_records/activity_records.service';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    private activityRecordsService: ActivityRecordsService,
  ) {}
  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
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

  async update(id: string, updateChallengeDto: UpdateChallengeDto): Promise<UpdateResult> {
    return await this.challengesRepository.update(id, updateChallengeDto);
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.challengesRepository.softDelete(id);
  }
}
