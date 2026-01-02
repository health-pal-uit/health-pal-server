import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateChallengesUserDto } from './dto/create-challenges_user.dto';
import { UpdateChallengesUserDto } from './dto/update-challenges_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesUser } from './entities/challenges_user.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ChallengesUsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    @InjectRepository(ChallengesUser) private challengesUsersRepository: Repository<ChallengesUser>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createChallengesUserDto: CreateChallengesUserDto): Promise<ChallengesUser> {
    const challengesUser = this.challengesUsersRepository.create(createChallengesUserDto);
    return this.challengesUsersRepository.save(challengesUser);
  }

  async findAll(): Promise<ChallengesUser[]> {
    return await this.challengesUsersRepository.find({ relations: ['user', 'challenge'] });
  }

  async findOne(id: string): Promise<ChallengesUser> {
    const challengeUser = await this.challengesUsersRepository.findOne({
      where: { id },
      relations: ['user', 'challenge'],
    });
    if (!challengeUser) {
      throw new NotFoundException(`ChallengesUser with id ${id} not found`);
    }
    return challengeUser;
  }

  async update(
    id: string,
    updateChallengesUserDto: UpdateChallengesUserDto,
  ): Promise<ChallengesUser> {
    await this.findOne(id); // Verify existence
    await this.challengesUsersRepository.update(id, updateChallengesUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.challengesUsersRepository.delete(id);
  }

  async finishChallenge(challengeId: string, userId: string): Promise<ChallengesUser> {
    // Check if challenge and user exist
    const challenge = await this.challengesRepository.findOneBy({ id: challengeId });
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!challenge || !user) {
      throw new NotFoundException('Challenge or User not found');
    }

    // Check if challenge is already finished
    const existingChallengeUser = await this.challengesUsersRepository.findOne({
      where: { user: { id: userId }, challenge: { id: challengeId } },
    });

    if (existingChallengeUser) {
      if (existingChallengeUser.completed_at) {
        throw new ConflictException('Challenge already finished by this user');
      }
      // update existing record to finished
      existingChallengeUser.progress_percent = 100;
      existingChallengeUser.completed_at = new Date();
      return await this.challengesUsersRepository.save(existingChallengeUser);
    }

    // create new finished challenge record
    const challenge_user = this.challengesUsersRepository.create({
      challenge,
      user,
      completed_at: new Date(),
      progress_percent: 100,
    });
    const saved = await this.challengesUsersRepository.save(challenge_user);

    // send notification to user
    await this.notificationsService.notifyChallengeCompleted(userId, challenge.name);

    return saved;
  }

  async checkProgress(userId: string): Promise<ChallengesUser[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const challenge_users = await this.challengesUsersRepository.findBy({ user: { id: userId } });
    return challenge_users;
  }

  async checkFinishedChallenges(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ChallengesUser[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const skip = (page - 1) * limit;
    // Single optimized query with relations
    const finishedChallenges = await this.challengesUsersRepository.find({
      where: { user: { id: userId }, progress_percent: 100 },
      relations: ['challenge', 'user'],
      skip,
      take: limit,
    });
    return finishedChallenges;
  }

  // get unfinished challenges
  async checkUnfinishedChallenges(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Challenge[]; total: number; page: number; limit: number }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // get finished challenge IDs
    const finishedChallengeUsers = await this.challengesUsersRepository.find({
      where: { user: { id: userId }, progress_percent: 100 },
      relations: { challenge: true },
    });
    const finishedChallengeIds = finishedChallengeUsers.map((cu) => cu.challenge.id);

    // get all challenges excluding finished ones
    const skip = (page - 1) * limit;
    const queryBuilder = this.challengesRepository.createQueryBuilder('challenge');
    queryBuilder.where('challenge.deleted_at IS NULL');

    if (finishedChallengeIds.length > 0) {
      queryBuilder.andWhere('challenge.id NOT IN (:...finishedChallengeIds)', {
        finishedChallengeIds,
      });
    }

    const [unfinishedChallenges, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('challenge.created_at', 'DESC')
      .getManyAndCount();

    return { data: unfinishedChallenges, total, page, limit };
  }

  async getOrCreateChallengesUser(userId: string, challengeId: string): Promise<ChallengesUser> {
    let challenge_user = await this.challengesUsersRepository.findOne({
      where: { user: { id: userId }, challenge: { id: challengeId } },
    });
    if (!challenge_user) {
      const user = await this.usersRepository.findOneBy({ id: userId });
      const challenge = await this.challengesRepository.findOneBy({ id: challengeId });
      if (!user || !challenge) {
        throw new NotFoundException('User or Challenge not found');
      }
      challenge_user = this.challengesUsersRepository.create({
        user,
        challenge,
        progress_percent: 0,
      });
      challenge_user = await this.challengesUsersRepository.save(challenge_user);
    }
    return challenge_user;
  }

  async save(challengeUser: ChallengesUser): Promise<ChallengesUser> {
    return await this.challengesUsersRepository.save(challengeUser);
  }
}
