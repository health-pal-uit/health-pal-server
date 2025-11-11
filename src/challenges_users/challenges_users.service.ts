import { Injectable } from '@nestjs/common';
import { CreateChallengesUserDto } from './dto/create-challenges_user.dto';
import { UpdateChallengesUserDto } from './dto/update-challenges_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesUser } from './entities/challenges_user.entity';

@Injectable()
export class ChallengesUsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    @InjectRepository(ChallengesUser) private challengesUsersRepository: Repository<ChallengesUser>,
  ) {}

  async create(createChallengesUserDto: CreateChallengesUserDto): Promise<ChallengesUser> {
    const challengesUser = this.challengesUsersRepository.create(createChallengesUserDto);
    return this.challengesUsersRepository.save(challengesUser);
  }

  async findAll(): Promise<ChallengesUser[]> {
    return await this.challengesUsersRepository.find({ relations: ['user', 'challenge'] });
  }

  async findOne(id: string): Promise<ChallengesUser | null> {
    return await this.challengesUsersRepository.findOne({
      where: { id },
      relations: ['user', 'challenge'],
    });
  }

  async update(
    id: string,
    updateChallengesUserDto: UpdateChallengesUserDto,
  ): Promise<ChallengesUser | null> {
    await this.challengesUsersRepository.update(id, updateChallengesUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.challengesUsersRepository.delete(id);
  }

  async finishChallenge(challengeId: string, userId: string): Promise<ChallengesUser> {
    const challenge = await this.challengesRepository.findOneBy({ id: challengeId });
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!challenge || !user) {
      throw new Error('Challenge or User not found');
    }
    const challenge_user = this.challengesUsersRepository.create();
    challenge_user.challenge = challenge;
    challenge_user.user = user;
    challenge_user.achieved_at = new Date();
    challenge_user.progress_percent = 100;
    // Implement the logic to finish the challenge for the user
    return await this.challengesUsersRepository.save(challenge_user);
  }

  async checkProgress(userId: string): Promise<ChallengesUser[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const challenge_users = await this.challengesUsersRepository.findBy({ user: { id: userId } });
    return challenge_users;
  }

  async checkFinishedChallenges(userId: string): Promise<Challenge[]> {
    const challenge_users = await this.checkProgress(userId);
    const challenges: Challenge[] = [];
    for (const cu of challenge_users) {
      const challenge = await this.challengesRepository.findOneBy({ id: cu.challenge.id });
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      if (
        challenge_users.find(
          (cu) => cu.challenge.id === challenge.id && cu.progress_percent === 100,
        )
      ) {
        challenges.push(challenge);
      }
    }
    return challenges;
  }

  async getOrCreateChallengesUser(userId: string, challengeId: string): Promise<ChallengesUser> {
    let challenge_user = await this.challengesUsersRepository.findOne({
      where: { user: { id: userId }, challenge: { id: challengeId } },
    });
    if (!challenge_user) {
      const user = await this.usersRepository.findOneBy({ id: userId });
      const challenge = await this.challengesRepository.findOneBy({ id: challengeId });
      if (!user || !challenge) {
        throw new Error('User or Challenge not found');
      }
      challenge_user = this.challengesUsersRepository.create({
        user,
        challenge,
        achieved_at: new Date(),
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
