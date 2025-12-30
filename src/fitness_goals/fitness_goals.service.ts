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

    // get user's fitness profile to access TDEE
    const fitnessProfile = await this.fitnessProfileRepository.findOne({
      where: { user: { id: userId }, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });

    let calculatedTargets: {
      target_kcal: number;
      target_protein_gr: number;
      target_fat_gr: number;
      target_carbs_gr: number;
      target_fiber_gr: number;
    };

    // if fitness profile exists, calculate targets based on TDEE and goal type
    if (fitnessProfile && fitnessProfile.tdee_kcal) {
      calculatedTargets = this.calculateTargetsFromTDEE(
        fitnessProfile.tdee_kcal,
        createFitnessGoalDto.goal_type,
        fitnessProfile.weight_kg,
      );
    } else {
      // fallback to 0 if no fitness profile exists
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

  // calculate fitness goal targets based on TDEE and goal type
  private calculateTargetsFromTDEE(
    tdee: number,
    goalType: FitnessGoalType,
    weightKg: number,
  ): {
    target_kcal: number;
    target_protein_gr: number;
    target_fat_gr: number;
    target_carbs_gr: number;
    target_fiber_gr: number;
  } {
    let targetKcal: number;
    let proteinGrPerKg: number;
    let fatPercentage: number;

    switch (goalType) {
      case FitnessGoalType.CUT:
        // deficit of 500 kcal for weight loss
        targetKcal = tdee - 500;
        proteinGrPerKg = 2.2; // high protein to preserve muscle
        fatPercentage = 0.25; // 25% of calories from fat
        break;

      case FitnessGoalType.BULK:
      case FitnessGoalType.GAIN_MUSCLES:
        // surplus of 300-500 kcal for muscle gain
        targetKcal = tdee + 400;
        proteinGrPerKg = 2.0; // high protein for muscle building
        fatPercentage = 0.25; // 25% of calories from fat
        break;

      case FitnessGoalType.MAINTAIN:
        // maintenance calories
        targetKcal = tdee;
        proteinGrPerKg = 1.8; // moderate protein
        fatPercentage = 0.3; // 30% of calories from fat
        break;

      case FitnessGoalType.RECOVERY:
        // slight surplus for recovery
        targetKcal = tdee + 200;
        proteinGrPerKg = 2.0; // high protein for recovery
        fatPercentage = 0.3; // 30% of calories from fat
        break;

      default:
        // fallback to maintenance
        targetKcal = tdee;
        proteinGrPerKg = 1.8;
        fatPercentage = 0.3;
    }

    // ensure target_kcal doesn't go below 1200 (safe minimum)
    targetKcal = Math.max(1200, targetKcal);

    // calculate protein in grams (4 kcal per gram)
    const targetProteinGr = Math.round(weightKg * proteinGrPerKg);
    const proteinKcal = targetProteinGr * 4;

    // calculate fat in grams (9 kcal per gram)
    const fatKcal = targetKcal * fatPercentage;
    const targetFatGr = Math.round(fatKcal / 9);

    // remaining calories go to carbs (4 kcal per gram)
    const remainingKcal = targetKcal - proteinKcal - fatKcal;
    const targetCarbsGr = Math.round(Math.max(0, remainingKcal / 4));

    // fiber target: 14g per 1000 kcal (general recommendation)
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

      // only recalculate if no manual targets are provided
      if (!hasManualTargets) {
        // get user's fitness profile to access TDEE
        const fitnessProfile = await this.fitnessProfileRepository.findOne({
          where: { user: { id: userId }, deleted_at: IsNull() },
          order: { created_at: 'DESC' },
        });

        if (fitnessProfile && fitnessProfile.tdee_kcal) {
          const calculatedTargets = this.calculateTargetsFromTDEE(
            fitnessProfile.tdee_kcal,
            updateFitnessGoalDto.goal_type,
            fitnessProfile.weight_kg,
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
}
