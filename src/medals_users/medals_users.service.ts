import { Injectable } from '@nestjs/common';
import { CreateMedalsUserDto } from './dto/create-medals_user.dto';
import { UpdateMedalsUserDto } from './dto/update-medals_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedalsUser } from './entities/medals_user.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesUser } from 'src/challenges_users/entities/challenges_user.entity';

@Injectable()
export class MedalsUsersService {
  constructor(
    @InjectRepository(MedalsUser) private medalsUsersRepository: Repository<MedalsUser>,
    @InjectRepository(Medal) private medalsRepository: Repository<Medal>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    @InjectRepository(ChallengesUser) private challengesUsersRepository: Repository<ChallengesUser>,
  ) {}

  async create(createMedalsUserDto: CreateMedalsUserDto): Promise<MedalsUser> {
    const medalsUser = this.medalsUsersRepository.create(createMedalsUserDto);
    return await this.medalsUsersRepository.save(medalsUser);
  }

  async findAll(): Promise<MedalsUser[]> {
    return await this.medalsUsersRepository.find();
  }

  async findOne(id: string): Promise<MedalsUser | null> {
    return await this.medalsUsersRepository.findOneBy({ id: id });
  }

  async update(id: string, updateMedalsUserDto: UpdateMedalsUserDto): Promise<UpdateResult> {
    return await this.medalsUsersRepository.update(id, updateMedalsUserDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.medalsUsersRepository.delete(id);
  }

  async finishMedal(medalId: string, userId: string): Promise<MedalsUser> {
    const medal = await this.medalsRepository.findOneBy({ id: medalId });
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    const medalChallenges = await this.challengesRepository.findBy({
      challenges_medals: { medal: { id: medalId } },
    });
    for (const challenge of medalChallenges) {
      const challengeUser = await this.challengesUsersRepository.findOneBy({
        challenge: { id: challenge.id },
        user: { id: userId },
      });
      if (!challengeUser) {
        throw new Error('User has not completed all challenges for this medal');
      }
      if (challengeUser.progress_percent! < 100) {
        throw new Error('User has not completed all challenges for this medal');
      }
    }

    if (!medal || !user) {
      throw new Error('Medal or User not found');
    }
    const medal_user = this.medalsUsersRepository.create();
    medal_user.medal = medal;
    medal_user.user = user;
    // Implement the logic to finish the medal for the user
    return await this.medalsUsersRepository.save(medal_user);
  }

  async checkProgress(userId: string): Promise<MedalsUser[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const medal_users = await this.medalsUsersRepository.findBy({ user: { id: userId } });
    return medal_users;
  }

  async checkFinishedMedals(userId: string): Promise<Medal[]> {
    const medal_users = await this.checkProgress(userId);
    const medals: Medal[] = [];
    for (const mu of medal_users) {
      const medal = await this.medalsRepository.findOneBy({ id: mu.medal.id });
      if (!medal) {
        throw new Error('Medal not found');
      }
      medals.push(medal);
    }
    return medals;
  }
}
