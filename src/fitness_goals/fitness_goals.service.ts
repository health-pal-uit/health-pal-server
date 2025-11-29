import { Injectable } from '@nestjs/common';
import { CreateFitnessGoalDto } from './dto/create-fitness_goal.dto';
import { UpdateFitnessGoalDto } from './dto/update-fitness_goal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FitnessGoal } from './entities/fitness_goal.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FitnessGoalsService {
  constructor(
    @InjectRepository(FitnessGoal) private fitnessGoalRepository: Repository<FitnessGoal>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<FitnessGoal[]> {
    return await this.fitnessGoalRepository.find({
      where: { user: { id: userId }, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async create(createFitnessGoalDto: CreateFitnessGoalDto, userId: string): Promise<FitnessGoal> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const fitnessGoal = this.fitnessGoalRepository.create({ ...createFitnessGoalDto });
    fitnessGoal.user = user;
    return await this.fitnessGoalRepository.save(fitnessGoal);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: FitnessGoal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.fitnessGoalRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findAllOfUser(userId: string): Promise<FitnessGoal[]> {
    return await this.fitnessGoalRepository.find({
      where: { user: { id: userId }, deleted_at: IsNull() },
    });
  }

  async findOne(id: string, userId: string): Promise<FitnessGoal | null> {
    return await this.fitnessGoalRepository.findOneBy({ id: id, user: { id: userId } });
  }

  async update(
    id: string,
    updateFitnessGoalDto: UpdateFitnessGoalDto,
    userId: string,
  ): Promise<UpdateResult> {
    return await this.fitnessGoalRepository.update(
      { id: id, user: { id: userId } },
      updateFitnessGoalDto,
    );
  }

  async remove(id: string, userId: string): Promise<UpdateResult> {
    const fitnessGoal = await this.fitnessGoalRepository.findOneBy({
      id: id,
      user: { id: userId },
    });
    if (!fitnessGoal) {
      throw new Error('Fitness Goal not found or you do not have permission to delete it');
    }
    return await this.fitnessGoalRepository.softDelete(id);
  }

  async findAllDeleted(): Promise<FitnessGoal[]> {
    return await this.fitnessGoalRepository
      .createQueryBuilder('goal')
      .withDeleted()
      .where('goal.deleted_at IS NOT NULL')
      .leftJoinAndSelect('goal.user', 'user')
      .getMany();
  }

  async restore(id: string, userId: string): Promise<UpdateResult> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const goal = await this.fitnessGoalRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['user'],
    });
    if (!goal) {
      throw new Error('Fitness goal not found');
    }
    if (goal.user.id !== userId) {
      throw new Error('You do not have access to restore this fitness goal');
    }
    return await this.fitnessGoalRepository.restore(id);
  }

  async checkReferences(
    _id: string,
    _userId: string,
  ): Promise<{ referenced: boolean; references: string[] }> {
    // Check if any ActivityRecord references this goal (if relation exists)
    // For now, always return false (no reference) unless you add the relation
    return { referenced: false, references: [] };
  }
}
