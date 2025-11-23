import { Injectable } from '@nestjs/common';
import { CreateContributionMealDto } from './dto/create-contribution_meal.dto';
import { UpdateContributionMealDto } from './dto/update-contribution_meal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Meal } from 'src/meals/entities/meal.entity';
import { DeleteResult, IsNull, Repository, UpdateResult } from 'typeorm';
import { ContributionMeal } from './entities/contribution_meal.entity';
import { ContributionStatus } from 'src/helpers/enums/contribution-status.enum';
import { ContributionOptions } from 'src/helpers/enums/contribution-options';
import { IngredientPayload } from 'src/meals/dto/ingredient-payload.type';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import { CreateMealDto } from 'src/meals/dto/create-meal.dto';
import { MealsService } from 'src/meals/meals.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContributionMealsService {
  constructor(
    @InjectRepository(ContributionMeal)
    private contributionMealRepository: Repository<ContributionMeal>,
    @InjectRepository(Meal) private mealsRepository: Repository<Meal>,
    @InjectRepository(IngreMeal) private ingreMealRepository: Repository<IngreMeal>,
    private mealsService: MealsService,
    private supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
  ) {}

  async findAllPending(): Promise<ContributionMeal[]> {
    return await this.contributionMealRepository.find({
      where: { status: ContributionStatus.PENDING, deleted_at: IsNull() },
    });
  }

  async createFromIngredients(
    dto: CreateContributionMealDto,
    ingredients: IngredientPayload[],
    userId: string,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<ContributionMeal> {
    if (imageBuffer && imageName) {
      const bucketName = this.configService.get<string>('MEAL_IMG_BUCKET_NAME') || 'meal-imgs';
      const storedImage = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      dto.image_url = storedImage;
    }
    const createdContribution = await this.create(dto, userId); // create contribution meal first
    const createMealDto: CreateMealDto = {
      name: createdContribution.name,
      protein_per_100gr: createdContribution.protein_per_100gr ?? undefined,
      fat_per_100gr: createdContribution.fat_per_100gr ?? undefined,
      carbs_per_100gr: createdContribution.carbs_per_100gr ?? undefined,
      fiber_per_100gr: createdContribution.fiber_per_100gr ?? undefined,
      kcal_per_100gr: createdContribution.kcal_per_100gr ?? undefined,
      notes: createdContribution.notes ?? undefined,
      tags: createdContribution.tags ?? undefined,
      image_url: createdContribution.image_url ?? undefined,
      serving_gr: createdContribution.serving_gr ?? undefined,
      is_verified: false,
    };
    const meal = await this.mealsService.createFromIngredients(createMealDto, ingredients);
    createdContribution.meal = meal;
    // create ingre_meals
    createdContribution.status = ContributionStatus.PENDING;
    createdContribution.opt = ContributionOptions.NEW;
    return await this.contributionMealRepository.save(createdContribution);
  }

  async adminReject(id: string, rejectionReason: string): Promise<UpdateResult> {
    return await this.contributionMealRepository.update(id, {
      status: ContributionStatus.REJECTED,
      rejection_reason: rejectionReason,
      reviewed_at: new Date(),
    });
    // notification here?
  }

  // convert to meal
  async adminApprove(id: string): Promise<Meal | UpdateResult> {
    await this.contributionMealRepository.update(id, { status: ContributionStatus.APPROVED });
    const existingContribution = await this.contributionMealRepository.findOne({ where: { id } });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.meal) {
      return await this.mealsRepository.update(existingContribution.meal!.id, {
        is_verified: true,
      }); // just verify if already has ingredients
    }
    const mealData: Partial<Meal> = {
      name: existingContribution.name,
      protein_per_100gr: existingContribution.protein_per_100gr ?? undefined,
      fat_per_100gr: existingContribution.fat_per_100gr ?? undefined,
      carbs_per_100gr: existingContribution.carbs_per_100gr ?? undefined,
      fiber_per_100gr: existingContribution.fiber_per_100gr ?? undefined,
      kcal_per_100gr: existingContribution.kcal_per_100gr ?? undefined,
      notes: existingContribution.notes ?? undefined,
      tags: existingContribution.tags ?? undefined,
      is_verified: true,
      image_url: existingContribution.image_url ?? undefined,
      serving_gr: existingContribution.serving_gr ?? undefined,
    };
    const meal = this.mealsRepository.create(mealData);
    const savedMeal = await this.mealsRepository.save(meal);
    existingContribution.meal = savedMeal;
    existingContribution.updated_at = new Date();
    await this.contributionMealRepository.save(existingContribution);
    return savedMeal;
  }

  async createDeleteContribution(id: string, userId: any): Promise<ContributionMeal> {
    const existingContribution = await this.contributionMealRepository.findOne({ where: { id } });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.user_id !== userId) {
      throw new Error('Access denied');
    }
    if (existingContribution.status !== ContributionStatus.PENDING) {
      throw new Error('Only pending contributions can be deleted');
    }
    return await this.contributionMealRepository.remove(existingContribution);
  }

  async createUpdateContribution(
    id: string,
    updateContributionMealDto: UpdateContributionMealDto,
    userId: any,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<ContributionMeal> {
    const existingContribution = await this.contributionMealRepository.findOne({ where: { id } });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.user_id !== userId) {
      throw new Error('Access denied');
    }
    if (existingContribution.status !== ContributionStatus.PENDING) {
      throw new Error('Only pending contributions can be updated');
    }
    const updatedContribution = Object.assign(existingContribution, updateContributionMealDto); // copy existing to update but prioritize update
    updatedContribution.opt = ContributionOptions.EDIT;
    updatedContribution.status = ContributionStatus.PENDING;
    if (imageBuffer && imageName) {
      const bucketName = this.configService.get<string>('MEAL_IMG_BUCKET_NAME') || 'meal-imgs';
      const storedImage = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      updatedContribution.image_url = storedImage;
    }
    return await this.contributionMealRepository.save(updatedContribution);
  }

  // edit
  async createContributionFromIngredients(
    id: string,
    ingredients: IngredientPayload[],
    userId: any,
  ): Promise<ContributionMeal> {
    const existingContribution = await this.contributionMealRepository.findOne({ where: { id } });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.user_id !== userId) {
      throw new Error('Access denied');
    }
    if (existingContribution.status !== ContributionStatus.PENDING) {
      throw new Error('Only pending contributions can be updated');
    }
    existingContribution.opt = ContributionOptions.EDIT;
    existingContribution.status = ContributionStatus.PENDING;
    await this.mealsService.updateFromIngredients(existingContribution.meal_id!, ingredients);
    return await this.contributionMealRepository.save(existingContribution);
  }
  async findOneUser(id: string, userId: any): Promise<ContributionMeal> {
    const contribution = await this.contributionMealRepository.findOne({ where: { id } });
    if (!contribution || contribution.user_id !== userId) {
      throw new Error('Contribution not found or access denied');
    }
    return contribution;
  }

  async findAllUser(userId: any): Promise<ContributionMeal[]> {
    return await this.contributionMealRepository.find({
      where: { user_id: userId, deleted_at: IsNull() },
    });
  }

  async create(
    createContributionMealDto: CreateContributionMealDto,
    userId: string,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<ContributionMeal> {
    const contributionMeal = this.contributionMealRepository.create({
      ...createContributionMealDto,
      user_id: userId,
    });
    contributionMeal.status = ContributionStatus.PENDING;
    contributionMeal.opt = ContributionOptions.NEW;

    if (imageBuffer && imageName) {
      const bucketName = this.configService.get<string>('MEAL_IMG_BUCKET_NAME') || 'meal-imgs';
      const storedImage = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      contributionMeal.image_url = storedImage;
    }

    return await this.contributionMealRepository.save(contributionMeal);
  }

  async findAll() {
    return await this.contributionMealRepository.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string) {
    return await this.contributionMealRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.contributionMealRepository.softDelete(id);
  }

  // user: get rejection reason/status for their own contribution
  async getRejectionInfo(id: string, userId: string) {
    const contribution = await this.contributionMealRepository.findOne({ where: { id } });
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    if (contribution.user_id !== userId) {
      throw new Error('You do not have access to this contribution');
    }
    return {
      status: contribution.status,
      rejection_reason: contribution.rejection_reason,
      reviewed_at: contribution.reviewed_at,
    };
  }
}
