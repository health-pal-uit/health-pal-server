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
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class MedalsUsersService {
  constructor(
    @InjectRepository(MedalsUser) private medalsUsersRepository: Repository<MedalsUser>,
    @InjectRepository(Medal) private medalsRepository: Repository<Medal>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    @InjectRepository(ChallengesUser) private challengesUsersRepository: Repository<ChallengesUser>,
    private notificationsService: NotificationsService,
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

  async update(id: string, updateMedalsUserDto: UpdateMedalsUserDto): Promise<MedalsUser | null> {
    await this.medalsUsersRepository.update(id, updateMedalsUserDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<MedalsUser | null> {
    const medalsUser = await this.findOne(id);
    await this.medalsUsersRepository.delete(id);
    return medalsUser;
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
    const saved = await this.medalsUsersRepository.save(medal_user);

    // send notification to user
    await this.notificationsService.notifyMedalClaimed(userId, medal.name);

    return saved;
  }

  async checkProgress(userId: string): Promise<MedalsUser[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const medal_users = await this.medalsUsersRepository.findBy({ user: { id: userId } });
    return medal_users;
  }

  async checkFinishedMedals(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Medal[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [medalUsers, total] = await this.medalsUsersRepository.findAndCount({
      where: { user: { id: userId } },
      relations: { medal: true },
      skip,
      take: limit,
      order: { achieved_at: 'DESC' },
    });
    const medals = medalUsers.map((mu) => mu.medal);
    return { data: medals, total, page, limit };
  }

  // get unfinished medals
  async checkUnfinishedMedals(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Medal[]; total: number; page: number; limit: number }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    // get finished medal IDs
    const finishedMedalUsers = await this.medalsUsersRepository.find({
      where: { user: { id: userId } },
      relations: { medal: true },
    });
    const finishedMedalIds = finishedMedalUsers.map((mu) => mu.medal.id);

    // get all medals excluding finished ones
    const skip = (page - 1) * limit;
    const queryBuilder = this.medalsRepository.createQueryBuilder('medal');
    queryBuilder.where('medal.deleted_at IS NULL');

    if (finishedMedalIds.length > 0) {
      queryBuilder.andWhere('medal.id NOT IN (:...finishedMedalIds)', { finishedMedalIds });
    }

    const [unfinishedMedals, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('medal.created_at', 'DESC')
      .getManyAndCount();

    return { data: unfinishedMedals, total, page, limit };
  }
}
