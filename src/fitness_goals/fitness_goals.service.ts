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

  async create(createFitnessGoalDto: CreateFitnessGoalDto, userId: string): Promise<FitnessGoal> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const fitnessGoal = this.fitnessGoalRepository.create({ ...createFitnessGoalDto });
    fitnessGoal.user = user;
    return await this.fitnessGoalRepository.save(fitnessGoal);
  }

  async findAll(): Promise<FitnessGoal[]> {
    return await this.fitnessGoalRepository.find({ where: { deleted_at: IsNull() } });
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
}
