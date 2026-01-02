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
import { NotificationsService } from 'src/notifications/notifications.service';

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
    private notificationsService: NotificationsService,
  ) {}

  async findAllPending(
    page = 1,
    limit = 10,
  ): Promise<{ data: ContributionMeal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.contributionMealRepository.findAndCount({
      where: { status: ContributionStatus.PENDING, deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findAllRejected(
    page = 1,
    limit = 10,
  ): Promise<{ data: ContributionMeal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.contributionMealRepository.findAndCount({
      where: { status: ContributionStatus.REJECTED, deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { reviewed_at: 'DESC' },
      relations: ['author'],
    });
    return { data, total, page, limit };
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

    const createdContribution = this.contributionMealRepository.create({
      ...dto,
      author: { id: userId } as any,
      status: ContributionStatus.PENDING,
      opt: ContributionOptions.NEW,
      ingredients_data: ingredients, // Store ingredients for later
    });

    return await this.contributionMealRepository.save(createdContribution);
  }

  async adminReject(id: string, rejectionReason: string): Promise<ContributionMeal> {
    const contribution = await this.contributionMealRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    contribution.status = ContributionStatus.REJECTED;
    contribution.rejection_reason = rejectionReason;
    contribution.reviewed_at = new Date();
    const savedContribution = await this.contributionMealRepository.save(contribution);

    // notify author
    if (contribution.author) {
      await this.notificationsService.sendToUser({
        user_id: contribution.author.id,
        title: '❌ Meal Contribution Rejected',
        content: `Your meal contribution "${contribution.name}" was rejected. Reason: ${rejectionReason}`,
      });
    }

    return savedContribution;
  }

  // convert to meal
  async adminApprove(id: string): Promise<ContributionMeal> {
    const existingContribution = await this.contributionMealRepository.findOne({
      where: { id },
      relations: ['meal', 'author'],
    });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }

    // edit case: update existing
    if (existingContribution.meal) {
      const updateData: Partial<Meal> = {
        name: existingContribution.name,
        protein_per_100gr: existingContribution.protein_per_100gr ?? undefined,
        fat_per_100gr: existingContribution.fat_per_100gr ?? undefined,
        carbs_per_100gr: existingContribution.carbs_per_100gr ?? undefined,
        fiber_per_100gr: existingContribution.fiber_per_100gr ?? undefined,
        kcal_per_100gr: existingContribution.kcal_per_100gr ?? undefined,
        notes: existingContribution.notes ?? undefined,
        tags: existingContribution.tags ?? undefined,
        image_url: existingContribution.image_url ?? undefined,
        serving_gr: existingContribution.serving_gr ?? undefined,
        is_verified: true,
      };

      // update from ingredients if available
      if (
        existingContribution.ingredients_data &&
        Array.isArray(existingContribution.ingredients_data)
      ) {
        await this.mealsService.updateFromIngredients(
          existingContribution.meal.id,
          existingContribution.ingredients_data,
        );
      } else {
        await this.mealsRepository.update(existingContribution.meal.id, updateData);
      }

      existingContribution.status = ContributionStatus.APPROVED;
      existingContribution.reviewed_at = new Date();
      const savedContribution = await this.contributionMealRepository.save(existingContribution);

      // notify author
      if (existingContribution.author) {
        await this.notificationsService.sendToUser({
          user_id: existingContribution.author.id,
          title: '✅ Meal Contribution Approved',
          content: `Your meal contribution "${existingContribution.name}" has been approved and is now available to all users!`,
        });
      }

      return savedContribution;
    }

    // new case: create meal
    const createMealDto: CreateMealDto = {
      name: existingContribution.name,
      protein_per_100gr: existingContribution.protein_per_100gr ?? undefined,
      fat_per_100gr: existingContribution.fat_per_100gr ?? undefined,
      carbs_per_100gr: existingContribution.carbs_per_100gr ?? undefined,
      fiber_per_100gr: existingContribution.fiber_per_100gr ?? undefined,
      kcal_per_100gr: existingContribution.kcal_per_100gr ?? undefined,
      notes: existingContribution.notes ?? undefined,
      tags: existingContribution.tags ?? undefined,
      image_url: existingContribution.image_url ?? undefined,
      serving_gr: existingContribution.serving_gr ?? undefined,
      is_verified: true,
    };

    let meal: Meal;
    // create from ingredients if available
    if (
      existingContribution.ingredients_data &&
      Array.isArray(existingContribution.ingredients_data)
    ) {
      const createdMeal = await this.mealsService.createFromIngredients(
        createMealDto,
        existingContribution.ingredients_data,
      );
      if (!createdMeal) {
        throw new Error('Failed to create meal from ingredients');
      }
      meal = createdMeal;
    } else {
      meal = this.mealsRepository.create(createMealDto);
      await this.mealsRepository.save(meal);
    }

    existingContribution.meal = meal;
    existingContribution.status = ContributionStatus.APPROVED;
    existingContribution.reviewed_at = new Date();
    const savedContribution = await this.contributionMealRepository.save(existingContribution);

    // notify author
    if (existingContribution.author) {
      await this.notificationsService.sendToUser({
        user_id: existingContribution.author.id,
        title: '✅ Meal Contribution Approved',
        content: `Your meal contribution "${existingContribution.name}" has been approved and is now available to all users!`,
      });
    }

    return savedContribution;
  }

  async createDeleteContribution(id: string, userId: any): Promise<ContributionMeal> {
    const existingContribution = await this.contributionMealRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.author?.id !== userId) {
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
    const existingContribution = await this.contributionMealRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.author?.id !== userId) {
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
    const existingContribution = await this.contributionMealRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.author?.id !== userId) {
      throw new Error('Access denied');
    }
    if (existingContribution.status !== ContributionStatus.PENDING) {
      throw new Error('Only pending contributions can be updated');
    }
    existingContribution.opt = ContributionOptions.EDIT;
    existingContribution.status = ContributionStatus.PENDING;
    existingContribution.ingredients_data = ingredients; // Update stored ingredients
    return await this.contributionMealRepository.save(existingContribution);
  }
  async findOneUser(id: string, userId: any): Promise<ContributionMeal> {
    const contribution = await this.contributionMealRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!contribution || contribution.author?.id !== userId) {
      throw new Error('Contribution not found or access denied');
    }
    return contribution;
  }

  async findAllUser(userId: any): Promise<ContributionMeal[]> {
    return await this.contributionMealRepository.find({
      where: { author: { id: userId }, deleted_at: IsNull() },
      relations: ['author'],
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
      author: { id: userId } as any,
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

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: ContributionMeal[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.contributionMealRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return await this.contributionMealRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.contributionMealRepository.softDelete(id);
  }

  // user: get rejection reason/status for their own contribution
  async getRejectionInfo(id: string, userId: string) {
    const contribution = await this.contributionMealRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    if (contribution.author?.id !== userId) {
      throw new Error('You do not have access to this contribution');
    }
    return {
      status: contribution.status,
      rejection_reason: contribution.rejection_reason,
      reviewed_at: contribution.reviewed_at,
    };
  }
}
