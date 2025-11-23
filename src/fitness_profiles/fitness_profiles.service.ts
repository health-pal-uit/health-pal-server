import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateFitnessProfileDto } from './dto/create-fitness_profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness_profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FitnessProfile } from './entities/fitness_profile.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { ActivityLevel } from 'src/helpers/enums/activity-level.enum';
import { User } from 'src/users/entities/user.entity';
import { BFPCalculatingMethod } from 'src/helpers/enums/bfp-calculating-method.enum';
import { BFFitnessProfileDto } from './dto/body-fat-fitness_profile.dto';
import { calculateAge } from 'src/helpers/functions/age-calculator';
import { cmToInch } from 'src/helpers/functions/cm-to-inch';
import { kgToLb } from 'src/helpers/functions/kg-to-lb';

@Injectable()
export class FitnessProfilesService {
  constructor(
    @InjectRepository(FitnessProfile) private fitnessProfileRepository: Repository<FitnessProfile>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(
    createFitnessProfileDto: CreateFitnessProfileDto,
    userId: string,
  ): Promise<FitnessProfile> {
    const fitnessProfile = this.fitnessProfileRepository.create(createFitnessProfileDto);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    fitnessProfile.user = user;

    // Calculate BMR, BMI, TDEE
    fitnessProfile.bmr = await this.calculateBMR(fitnessProfile);
    fitnessProfile.bmi = await this.calculateBMI(fitnessProfile);
    fitnessProfile.tdee_kcal = await this.calculateTDEE(fitnessProfile);

    return await this.fitnessProfileRepository.save(fitnessProfile);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: FitnessProfile[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.fitnessProfileRepository.findAndCount({
      where: { deleted_at: IsNull() },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(userId: string): Promise<FitnessProfile | null> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const fitnessProfile = await this.fitnessProfileRepository.findOne({ where: { user } });
    if (!fitnessProfile) {
      throw new UnauthorizedException('You do not have access to this fitness profile');
    }
    return fitnessProfile;
  }

  async update(
    updateFitnessProfileDto: UpdateFitnessProfileDto,
    userId: string,
  ): Promise<UpdateResult> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['fitnessProfiles'],
    });
    const fitnessProfileId = user?.fitness_profiles?.[0]?.id;
    if (!user) {
      throw new Error('User not found');
    }
    const fitnessProfile = await this.fitnessProfileRepository.findOne({
      where: { id: fitnessProfileId, user },
    });
    if (!fitnessProfile) {
      throw new UnauthorizedException('You do not have access to this fitness profile');
    }

    if (updateFitnessProfileDto.weight_kg !== undefined) {
      fitnessProfile.weight_kg = updateFitnessProfileDto.weight_kg;
    }
    if (updateFitnessProfileDto.height_m !== undefined) {
      fitnessProfile.height_m = updateFitnessProfileDto.height_m;
    }
    if (updateFitnessProfileDto.activity_level !== undefined) {
      fitnessProfile.activity_level = updateFitnessProfileDto.activity_level;
    }

    // Calculate BMR, BMI, TDEE with updated values
    fitnessProfile.bmr = this.calculateBMR(fitnessProfile);
    fitnessProfile.bmi = this.calculateBMI(fitnessProfile);
    fitnessProfile.tdee_kcal = this.calculateTDEE(fitnessProfile);

    // Merge calculated values into DTO before update
    updateFitnessProfileDto.bmr = fitnessProfile.bmr;
    updateFitnessProfileDto.bmi = fitnessProfile.bmi;
    updateFitnessProfileDto.tdee_kcal = fitnessProfile.tdee_kcal;

    return await this.fitnessProfileRepository.update(fitnessProfileId!, updateFitnessProfileDto);
  }

  async findAllForUser(userId: string): Promise<FitnessProfile[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    return await this.fitnessProfileRepository.find({ where: { user, deleted_at: IsNull() } });
  }

  async findAllDeleted(): Promise<FitnessProfile[]> {
    // TypeORM does not support string where for deleted_at, so use QueryBuilder
    return await this.fitnessProfileRepository
      .createQueryBuilder('profile')
      .withDeleted()
      .where('profile.deleted_at IS NOT NULL')
      .leftJoinAndSelect('profile.user', 'user')
      .getMany();
  }

  async restore(id: string, userId: string): Promise<UpdateResult> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const profile = await this.fitnessProfileRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['user'],
    });
    if (!profile) {
      throw new Error('Fitness profile not found');
    }
    if (profile.user.id !== userId) {
      throw new UnauthorizedException('You do not have access to restore this fitness profile');
    }
    return await this.fitnessProfileRepository.restore(id);
  }

  async remove(id: string, userId: string): Promise<UpdateResult> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const fitnessProfile = await this.fitnessProfileRepository.findOne({ where: { id, user } });
    if (!fitnessProfile) {
      throw new UnauthorizedException('You do not have access to this fitness profile');
    }
    return await this.fitnessProfileRepository.softDelete(id);
  }

  calculateBMR(fitnessProfile: FitnessProfile) {
    const user = fitnessProfile.user;
    if (!user || !user.birth_date) {
      throw new Error('User or birth date not found for BMR calculation');
    }
    const birthDate = new Date(user.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Mifflin-St Jeor Equation
    const weight = fitnessProfile.weight_kg;
    const height = fitnessProfile.height_m * 100;

    if (user.gender === false) {
      // gender = female
      const bmr = 10 * weight + 6.25 * height - 5 * age - 161; //
      return bmr;
    } else {
      // gender = male
      const bmr = 10 * weight + 6.25 * height - 5 * age + 5; //
      return bmr;
    }
  }

  calculateBMI(fitnessProfile: FitnessProfile): number {
    const weight = fitnessProfile.weight_kg;
    const height = fitnessProfile.height_m;
    const bmi = weight / (height * height);
    return bmi;
  }

  calculateTDEE(fitnessProfile: FitnessProfile): number {
    const bmr = this.calculateBMR(fitnessProfile);
    let activityMultiplier = 1.2; // Sedentary

    switch (fitnessProfile.activity_level) {
      case ActivityLevel.SEDENTARY:
        activityMultiplier = 1.2;
        break;
      case ActivityLevel.LIGHTLY_ACTIVE:
        activityMultiplier = 1.375;
        break;
      case ActivityLevel.MODERATELY:
        activityMultiplier = 1.55;
        break;
      case ActivityLevel.ACTIVE:
        activityMultiplier = 1.725;
        break;
      case ActivityLevel.VERY_ACTIVE:
        activityMultiplier = 1.9;
        break;
    }
    const tdee = bmr * activityMultiplier;
    return tdee;
  }

  async calculateBodyFatPercentage(
    userId: string,
    bFFitnessProfileDto: BFFitnessProfileDto,
  ): Promise<UpdateResult> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const fitnessProfile = await this.fitnessProfileRepository.findOne({ where: { user } });
    if (!fitnessProfile) {
      throw new Error('Fitness profile not found for the user');
    }
    const fitnessProfileEntity = await this.fitnessProfileRepository.findOne({
      where: { id: fitnessProfile.id },
      relations: ['user'],
    });
    if (!fitnessProfileEntity) {
      throw new Error('Fitness profile not found');
    }
    fitnessProfileEntity.hip_cm = bFFitnessProfileDto.hip_cm;
    fitnessProfileEntity.waist_cm = bFFitnessProfileDto.waist_cm;
    fitnessProfileEntity.neck_cm = bFFitnessProfileDto.neck_cm;
    fitnessProfileEntity.body_fat_calculating_method =
      bFFitnessProfileDto.body_fat_calculating_method || BFPCalculatingMethod.BMI;

    if (fitnessProfileEntity.body_fat_calculating_method === BFPCalculatingMethod.BMI) {
      const bmi = this.calculateBMI(fitnessProfileEntity);
      const user = fitnessProfileEntity.user;
      const age = calculateAge(user.birth_date);
      if (!user || age == null || user.gender == null) {
        throw new Error(
          'User, age, and gender must be provided for BMI-based body fat calculation',
        );
      }

      // Calculate body fat percentage using BMI
      if (user.gender === true) {
        const bfp = 1.2 * bmi + 0.23 * age - 16.2;
        const clampedBFP = Math.max(0, Math.min(70, +bfp.toFixed(2))); // Clamp between 0 and 70
        return await this.fitnessProfileRepository.update(fitnessProfileEntity.id, {
          ...fitnessProfileEntity,
          body_fat_percentages: clampedBFP,
        });
      } else {
        const bfp = 1.2 * bmi + 0.23 * age - 5.4;
        const clampedBFP = Math.max(0, Math.min(70, +bfp.toFixed(2))); // Clamp between 0 and 70
        return await this.fitnessProfileRepository.update(fitnessProfileEntity.id, {
          ...fitnessProfileEntity,
          body_fat_percentages: clampedBFP,
        });
      }
    } else if (fitnessProfileEntity.body_fat_calculating_method === BFPCalculatingMethod.US_NAVY) {
      const neckCircumference = cmToInch(fitnessProfileEntity.neck_cm);
      const waistCircumference = cmToInch(fitnessProfileEntity.waist_cm);
      const hipCircumference = cmToInch(fitnessProfileEntity.hip_cm);

      const user = fitnessProfileEntity.user;
      const height = cmToInch(fitnessProfileEntity.height_m * 100); // convert to inch

      if (height < 0)
        throw new Error('Height must be greater than 0 for US Navy body fat calculation');
      if (user.gender === true) {
        if (waistCircumference - neckCircumference <= 0) {
          throw new Error('Invalid measurements for US Navy body fat calculation');
        }
        // Male
        const bfp =
          86.01 * Math.log10(waistCircumference - neckCircumference) -
          70.041 * Math.log10(height) +
          36.76;
        const clampedBFP = Math.max(0, Math.min(70, +bfp.toFixed(2))); // Clamp between 0 and 70
        return await this.fitnessProfileRepository.update(fitnessProfileEntity.id, {
          ...fitnessProfileEntity,
          body_fat_percentages: clampedBFP,
        });
      } else {
        // Female
        const bfp =
          163.205 * Math.log10(waistCircumference + hipCircumference - neckCircumference) -
          97.684 * Math.log10(height) -
          78.387;
        const clampedBFP = Math.max(0, Math.min(70, +bfp.toFixed(2))); // Clamp between 0 and 70
        return await this.fitnessProfileRepository.update(fitnessProfileEntity.id, {
          ...fitnessProfileEntity,
          body_fat_percentages: clampedBFP,
        });
      }
    } else if (fitnessProfileEntity.body_fat_calculating_method === BFPCalculatingMethod.YMCA) {
      const waistCircumference = cmToInch(fitnessProfileEntity.waist_cm);
      const weight = kgToLb(fitnessProfileEntity.weight_kg);

      const user = fitnessProfileEntity.user;

      if (user.gender === true) {
        // Male
        const bfp = 1.634 * waistCircumference - 0.1804 * weight - 98.42;
        const clampedBFP = Math.max(0, Math.min(70, +bfp.toFixed(2))); // Clamp between 0 and 70
        return await this.fitnessProfileRepository.update(fitnessProfileEntity.id, {
          ...fitnessProfileEntity,
          body_fat_percentages: clampedBFP,
        });
      } else {
        // Female
        const bfp = 1.634 * waistCircumference - 0.1804 * weight - 76.76;
        const clampedBFP = Math.max(0, Math.min(70, +bfp.toFixed(2))); // Clamp between 0 and 70
        return await this.fitnessProfileRepository.update(fitnessProfileEntity.id, {
          ...fitnessProfileEntity,
          body_fat_percentages: clampedBFP,
        });
      }
    }
    return await this.fitnessProfileRepository.update(fitnessProfileEntity.id, {
      ...fitnessProfileEntity,
    });
  }
}
