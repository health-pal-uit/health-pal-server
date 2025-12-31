import { Injectable } from '@nestjs/common';
import { CreateFitnessGoalDto } from './dto/create-fitness_goal.dto';
import { UpdateFitnessGoalDto } from './dto/update-fitness_goal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FitnessGoal } from './entities/fitness_goal.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { FitnessProfile } from 'src/fitness_profiles/entities/fitness_profile.entity';
import { FitnessGoalType } from 'src/helpers/enums/fitness-goal-type.enum';

@Injectable()
export class FitnessGoalsService {
  constructor(
    @InjectRepository(FitnessGoal) private fitnessGoalRepository: Repository<FitnessGoal>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(FitnessProfile) private fitnessProfileRepository: Repository<FitnessProfile>,
  ) {}

  async findByUserId(userId: string): Promise<FitnessGoal[]> {
    return await this.fitnessGoalRepository.find({
      where: { user: { id: userId }, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findLatestByUserId(userId: string): Promise<FitnessGoal | null> {
    return await this.fitnessGoalRepository.findOne({
      where: { user: { id: userId }, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async create(createFitnessGoalDto: CreateFitnessGoalDto, userId: string): Promise<FitnessGoal> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const fitnessProfile = await this.fitnessProfileRepository.findOne({
      where: { user: { id: userId }, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
      relations: ['diet_type'],
    });

    let calculatedTargets: {
      target_kcal: number;
      target_protein_gr: number;
      target_fat_gr: number;
      target_carbs_gr: number;
      target_fiber_gr: number;
    };

    if (fitnessProfile && fitnessProfile.tdee_kcal) {
      calculatedTargets = this.calculateTargetsFromTDEE(
        fitnessProfile.tdee_kcal,
        createFitnessGoalDto.goal_type,
        fitnessProfile.diet_type,
      );
    } else {
      calculatedTargets = {
        target_kcal: 0,
        target_protein_gr: 0,
        target_fat_gr: 0,
        target_carbs_gr: 0,
        target_fiber_gr: 0,
      };
    }

    const fitnessGoal = this.fitnessGoalRepository.create({
      ...createFitnessGoalDto,
      // use provided values if present, otherwise use calculated values
      target_kcal: createFitnessGoalDto.target_kcal ?? calculatedTargets.target_kcal,
      target_protein_gr:
        createFitnessGoalDto.target_protein_gr ?? calculatedTargets.target_protein_gr,
      target_fat_gr: createFitnessGoalDto.target_fat_gr ?? calculatedTargets.target_fat_gr,
      target_carbs_gr: createFitnessGoalDto.target_carbs_gr ?? calculatedTargets.target_carbs_gr,
      target_fiber_gr: createFitnessGoalDto.target_fiber_gr ?? calculatedTargets.target_fiber_gr,
    });
    fitnessGoal.user = user;
    return await this.fitnessGoalRepository.save(fitnessGoal);
  }

  private calculateTargetsFromTDEE(
    tdee: number,
    goalType: FitnessGoalType,
    dietType: any,
  ): {
    target_kcal: number;
    target_protein_gr: number;
    target_fat_gr: number;
    target_carbs_gr: number;
    target_fiber_gr: number;
  } {
    let targetKcal: number;

    switch (goalType) {
      case FitnessGoalType.CUT:
        targetKcal = tdee - 500;
        break;
      case FitnessGoalType.BULK:
      case FitnessGoalType.GAIN_MUSCLES:
        targetKcal = tdee + 400;
        break;
      case FitnessGoalType.MAINTAIN:
        targetKcal = tdee;
        break;
      case FitnessGoalType.RECOVERY:
        targetKcal = tdee + 200;
        break;
      default:
        targetKcal = tdee;
    }

    targetKcal = Math.max(1200, targetKcal);

    let proteinPercentage: number;
    let fatPercentage: number;
    let carbsPercentage: number;

    if (dietType) {
      proteinPercentage = dietType.protein_percentages / 100;
      fatPercentage = dietType.fat_percentages / 100;
      carbsPercentage = dietType.carbs_percentages / 100;
    } else {
      proteinPercentage = 0.3;
      fatPercentage = 0.25;
      carbsPercentage = 0.45;
    }

    const targetProteinGr = Math.round((targetKcal * proteinPercentage) / 4);
    const targetFatGr = Math.round((targetKcal * fatPercentage) / 9);
    const targetCarbsGr = Math.round((targetKcal * carbsPercentage) / 4);
    const targetFiberGr = Math.round((targetKcal / 1000) * 14);

    return {
      target_kcal: Math.round(targetKcal),
      target_protein_gr: targetProteinGr,
      target_fat_gr: targetFatGr,
      target_carbs_gr: targetCarbsGr,
      target_fiber_gr: targetFiberGr,
    };
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
  ): Promise<FitnessGoal | null> {
    // get existing fitness goal
    const existingGoal = await this.fitnessGoalRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!existingGoal) {
      throw new Error('Fitness goal not found');
    }

    // if goal_type is being updated and no manual targets are provided, recalculate
    if (
      updateFitnessGoalDto.goal_type &&
      updateFitnessGoalDto.goal_type !== existingGoal.goal_type
    ) {
      // check if any target values are provided in the DTO
      const hasManualTargets =
        updateFitnessGoalDto.target_kcal !== undefined ||
        updateFitnessGoalDto.target_protein_gr !== undefined ||
        updateFitnessGoalDto.target_fat_gr !== undefined ||
        updateFitnessGoalDto.target_carbs_gr !== undefined ||
        updateFitnessGoalDto.target_fiber_gr !== undefined;

      if (!hasManualTargets) {
        const fitnessProfile = await this.fitnessProfileRepository.findOne({
          where: { user: { id: userId }, deleted_at: IsNull() },
          order: { created_at: 'DESC' },
          relations: ['diet_type'],
        });

        if (fitnessProfile && fitnessProfile.tdee_kcal) {
          const calculatedTargets = this.calculateTargetsFromTDEE(
            fitnessProfile.tdee_kcal,
            updateFitnessGoalDto.goal_type,
            fitnessProfile.diet_type,
          );

          // merge calculated targets into update DTO
          updateFitnessGoalDto.target_kcal = calculatedTargets.target_kcal;
          updateFitnessGoalDto.target_protein_gr = calculatedTargets.target_protein_gr;
          updateFitnessGoalDto.target_fat_gr = calculatedTargets.target_fat_gr;
          updateFitnessGoalDto.target_carbs_gr = calculatedTargets.target_carbs_gr;
          updateFitnessGoalDto.target_fiber_gr = calculatedTargets.target_fiber_gr;
        }
      }
    }

    await this.fitnessGoalRepository.update({ id: id, user: { id: userId } }, updateFitnessGoalDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<FitnessGoal | null> {
    const fitnessGoal = await this.fitnessGoalRepository.findOneBy({
      id: id,
      user: { id: userId },
    });
    if (!fitnessGoal) {
      throw new Error('Fitness Goal not found or you do not have permission to delete it');
    }
    await this.fitnessGoalRepository.softDelete(id);
    return this.fitnessGoalRepository
      .createQueryBuilder('goal')
      .where('goal.id = :id', { id })
      .withDeleted()
      .getOne();
  }

  async findAllDeleted(): Promise<FitnessGoal[]> {
    return await this.fitnessGoalRepository
      .createQueryBuilder('goal')
      .withDeleted()
      .where('goal.deleted_at IS NOT NULL')
      .leftJoinAndSelect('goal.user', 'user')
      .getMany();
  }

  async restore(id: string, userId: string): Promise<FitnessGoal | null> {
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
    await this.fitnessGoalRepository.restore(id);
    return this.findOne(id, userId);
  }

  async checkReferences(
    _id: string,
    _userId: string,
  ): Promise<{ referenced: boolean; references: string[] }> {
    // Check if any ActivityRecord references this goal (if relation exists)
    // For now, always return false (no reference) unless you add the relation
    return { referenced: false, references: [] };
  }

  async updateGoalsAfterDietTypeChange(userId: string, fitnessProfile: any): Promise<void> {
    // get all active (non-deleted) fitness goals for this user
    const goals = await this.fitnessGoalRepository.find({
      where: { user: { id: userId }, deleted_at: IsNull() },
    });

    // update each goal with new macros based on new diet type
    for (const goal of goals) {
      if (fitnessProfile.tdee_kcal && fitnessProfile.diet_type) {
        const calculatedTargets = this.calculateTargetsFromTDEE(
          fitnessProfile.tdee_kcal,
          goal.goal_type,
          fitnessProfile.diet_type,
        );

        // update the goal with new targets
        goal.target_kcal = calculatedTargets.target_kcal;
        goal.target_protein_gr = calculatedTargets.target_protein_gr;
        goal.target_fat_gr = calculatedTargets.target_fat_gr;
        goal.target_carbs_gr = calculatedTargets.target_carbs_gr;
        goal.target_fiber_gr = calculatedTargets.target_fiber_gr;

        await this.fitnessGoalRepository.save(goal);
      }
    }
  }
}
