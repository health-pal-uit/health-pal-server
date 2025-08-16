import { Injectable } from '@nestjs/common';
import { CreateChallengesUserDto } from './dto/create-challenges_user.dto';
import { UpdateChallengesUserDto } from './dto/update-challenges_user.dto';

@Injectable()
export class ChallengesUsersService {
  create(createChallengesUserDto: CreateChallengesUserDto) {
    return 'This action adds a new challengesUser';
  }

  findAll() {
    return `This action returns all challengesUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} challengesUser`;
  }

  update(id: number, updateChallengesUserDto: UpdateChallengesUserDto) {
    return `This action updates a #${id} challengesUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} challengesUser`;
  }
}
