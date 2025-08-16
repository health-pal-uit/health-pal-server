import { Injectable } from '@nestjs/common';
import { CreateChallengesMedalDto } from './dto/create-challenges_medal.dto';
import { UpdateChallengesMedalDto } from './dto/update-challenges_medal.dto';

@Injectable()
export class ChallengesMedalsService {
  create(createChallengesMedalDto: CreateChallengesMedalDto) {
    return 'This action adds a new challengesMedal';
  }

  findAll() {
    return `This action returns all challengesMedals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} challengesMedal`;
  }

  update(id: number, updateChallengesMedalDto: UpdateChallengesMedalDto) {
    return `This action updates a #${id} challengesMedal`;
  }

  remove(id: number) {
    return `This action removes a #${id} challengesMedal`;
  }
}
