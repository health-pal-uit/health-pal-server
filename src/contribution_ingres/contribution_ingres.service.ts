import { Injectable } from '@nestjs/common';
import { CreateContributionIngreDto } from './dto/create-contribution_ingre.dto';
import { UpdateContributionIngreDto } from './dto/update-contribution_ingre.dto';
import { UpdateIngredientDto } from 'src/ingredients/dto/update-ingredient.dto';
import { ContributionIngre } from './entities/contribution_ingre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, IsNull, Repository, UpdateResult } from 'typeorm';
import { ContributionStatus } from 'src/helpers/enums/contribution-status.enum';
import { ContributionOptions } from 'src/helpers/enums/contribution-options';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ContributionIngresService {
  constructor(
    @InjectRepository(ContributionIngre)
    private contributionIngreRepository: Repository<ContributionIngre>,
    @InjectRepository(Ingredient) private ingredientRepository: Repository<Ingredient>,
    private supabaseStorageService: SupabaseStorageService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  async findAllPending(
    page = 1,
    limit = 10,
  ): Promise<{ data: ContributionIngre[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.contributionIngreRepository.findAndCount({
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
  ): Promise<{ data: ContributionIngre[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.contributionIngreRepository.findAndCount({
      where: { status: ContributionStatus.REJECTED, deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { reviewed_at: 'DESC' },
      relations: ['author'],
    });
    return { data, total, page, limit };
  }

  async adminReject(id: string, reason?: string): Promise<ContributionIngre> {
    const contribution = await this.contributionIngreRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    contribution.status = ContributionStatus.REJECTED;
    contribution.rejection_reason = reason || null;
    contribution.reviewed_at = new Date();
    const savedContribution = await this.contributionIngreRepository.save(contribution);

    // notify author
    if (contribution.author) {
      await this.notificationsService.sendToUser({
        user_id: contribution.author.id,
        title: '❌ Ingredient Contribution Rejected',
        content: `Your ingredient contribution "${contribution.name}" was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      });
    }

    return savedContribution;
  }
  // user: get rejection reason/status for their own contribution
  async getRejectionInfo(id: string, userId: string) {
    const contribution = await this.contributionIngreRepository.findOne({
      where: { id },
      relations: ['author'],
    });
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

  // convert to real ingredient
  async adminApprove(id: string): Promise<ContributionIngre> {
    const contribution = await this.contributionIngreRepository.findOne({
      where: { id },
      relations: ['ingredient', 'author'],
    });
    if (!contribution) {
      throw new Error('Contribution not found');
    }

    // edit case: update existing
    if (contribution.ingredient) {
      const updateData: Partial<Ingredient> = {
        name: contribution.name,
        kcal_per_100gr: contribution.kcal_per_100gr,
        protein_per_100gr: contribution.protein_per_100gr ?? undefined,
        fat_per_100gr: contribution.fat_per_100gr ?? undefined,
        carbs_per_100gr: contribution.carbs_per_100gr ?? undefined,
        fiber_per_100gr: contribution.fiber_per_100gr ?? undefined,
        notes: contribution.notes ?? undefined,
        tags: contribution.tags ?? undefined,
        image_url: contribution.image_url ?? undefined,
        is_verified: true,
      };
      await this.ingredientRepository.update(contribution.ingredient.id, updateData);
      contribution.status = ContributionStatus.APPROVED;
      contribution.reviewed_at = new Date();
      const savedContribution = await this.contributionIngreRepository.save(contribution);

      // notify author
      if (contribution.author) {
        await this.notificationsService.sendToUser({
          user_id: contribution.author.id,
          title: '✅ Ingredient Contribution Approved',
          content: `Your ingredient contribution "${contribution.name}" has been approved and is now available to all users!`,
        });
      }

      return savedContribution;
    }

    // new case: create ingredient
    const ingredientData: Partial<Ingredient> = {
      name: contribution.name,
      kcal_per_100gr: contribution.kcal_per_100gr ?? undefined,
      protein_per_100gr: contribution.protein_per_100gr ?? undefined,
      fat_per_100gr: contribution.fat_per_100gr ?? undefined,
      carbs_per_100gr: contribution.carbs_per_100gr ?? undefined,
      fiber_per_100gr: contribution.fiber_per_100gr ?? undefined,
      notes: contribution.notes ?? undefined,
      tags: contribution.tags ?? undefined,
      is_verified: true,
      image_url: contribution.image_url ?? undefined,
    };
    const ingredient = this.ingredientRepository.create(ingredientData);
    const savedIngredient = await this.ingredientRepository.save(ingredient);
    contribution.ingredient = savedIngredient;
    contribution.updated_at = new Date();
    contribution.status = ContributionStatus.APPROVED;
    contribution.reviewed_at = new Date();
    const savedContribution = await this.contributionIngreRepository.save(contribution);

    // notify author
    if (contribution.author) {
      await this.notificationsService.sendToUser({
        user_id: contribution.author.id,
        title: '✅ Ingredient Contribution Approved',
        content: `Your ingredient contribution "${contribution.name}" has been approved and is now available to all users!`,
      });
    }

    return savedContribution;
  }

  async findAllUser(id: any): Promise<ContributionIngre[]> {
    return await this.contributionIngreRepository.find({
      where: { author: { id } },
      relations: ['author'],
    });
  }

  async findOneUser(id: string, userId: string): Promise<ContributionIngre | null> {
    // if its theirs
    const contribution = await this.contributionIngreRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    if (contribution.author?.id !== userId) {
      throw new Error('You do not have access to this contribution');
    }
    return contribution;
  }

  async createUpdateContribution(
    id: string,
    updateContributionIngreDto: UpdateContributionIngreDto,
    userId: string,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<ContributionIngre> {
    const existingContribution = await this.contributionIngreRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.author?.id !== userId) {
      throw new Error('You do not have access to this contribution');
    }
    if (existingContribution.status !== ContributionStatus.PENDING) {
      throw new Error('Only pending contributions can be updated');
    }
    const updatedContribution = Object.assign(existingContribution, updateContributionIngreDto); // copy existing to update but prioritize update
    updatedContribution.opt = ContributionOptions.EDIT;
    updatedContribution.status = ContributionStatus.PENDING;
    if (imageBuffer && imageName) {
      const bucketName =
        this.configService.get<string>('INGREDIENT_IMG_BUCKET_NAME') || 'ingredient-imgs';
      const imagePath = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      updatedContribution.image_url = imagePath;
    }
    return await this.contributionIngreRepository.save(updatedContribution);
  }

  async createDeleteContribution(id: string, userId: string): Promise<ContributionIngre> {
    const existingContribution = await this.contributionIngreRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.author?.id !== userId) {
      throw new Error('You do not have access to this contribution');
    }
    if (existingContribution.status !== ContributionStatus.PENDING) {
      throw new Error('Only pending contributions can be deleted');
    }
    await this.contributionIngreRepository.remove(existingContribution);
    return existingContribution;
  }

  async create(
    createContributionIngreDto: CreateContributionIngreDto,
    userId: string,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<ContributionIngre> {
    const contributionIngre = this.contributionIngreRepository.create({
      ...createContributionIngreDto,
      author: { id: userId } as any,
    });
    contributionIngre.opt = ContributionOptions.NEW;
    contributionIngre.status = ContributionStatus.PENDING;
    if (imageBuffer && imageName) {
      const bucketName =
        this.configService.get<string>('INGREDIENT_IMG_BUCKET_NAME') || 'ingredient-imgs';
      const imagePath = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      contributionIngre.image_url = imagePath;
    }
    return await this.contributionIngreRepository.save(contributionIngre);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: ContributionIngre[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.contributionIngreRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ContributionIngre | null> {
    return await this.contributionIngreRepository.findOne({ where: { id } });
  }

  // async update(id: string, updateContributionIngreDto: UpdateContributionIngreDto) : Promise {
  //   return await this.contributionIngreRepository.update(id, updateContributionIngreDto);
  // }

  async remove(id: string): Promise<UpdateResult> {
    return await this.contributionIngreRepository.softDelete(id);
  }
}
