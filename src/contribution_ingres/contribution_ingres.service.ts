import { Injectable } from '@nestjs/common';
import { CreateContributionIngreDto } from './dto/create-contribution_ingre.dto';
import { UpdateContributionIngreDto } from './dto/update-contribution_ingre.dto';
import { UpdateIngredientDto } from 'src/ingredients/dto/update-ingredient.dto';
import { ContributionIngre } from './entities/contribution_ingre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ContributionStatus } from 'src/helpers/enums/contribution-status.enum';
import { ContributionOptions } from 'src/helpers/enums/contribution-options';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@Injectable()
export class ContributionIngresService {
  constructor(
    @InjectRepository(ContributionIngre)
    private contributionIngreRepository: Repository<ContributionIngre>,
    @InjectRepository(Ingredient) private ingredientRepository: Repository<Ingredient>,
  ) {}

  async findAllPending(): Promise<ContributionIngre[]> {
    return await this.contributionIngreRepository.find({
      where: { status: ContributionStatus.PENDING },
    });
  }

  async adminReject(id: string): Promise<UpdateResult> {
    return await this.contributionIngreRepository.update(id, {
      status: ContributionStatus.REJECTED,
    });
  }

  // convert to real ingredient
  async adminApprove(id: string): Promise<Ingredient | UpdateResult> {
    await this.contributionIngreRepository.update(id, { status: ContributionStatus.APPROVED });
    const contribution = await this.contributionIngreRepository.findOne({ where: { id } });
    if (!contribution) {
      throw new Error('Contribution not found');
    }
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
    await this.contributionIngreRepository.save(contribution);
    return savedIngredient;
    // if (contribution.opt === ContributionOptions.NEW) {
    //   // create new ingredient

    // }
    // else if (contribution.opt === ContributionOptions.EDIT) {
    //   // update existing ingredient
    //   if (!contribution.ingredient_id) {
    //     throw new Error('No ingredient to edit');
    //   }

    //   const ingredient = await this.ingredientRepository.findOne({ where: { id: contribution.ingredient_id } });
    //   if (!ingredient) {
    //     throw new Error('Ingredient not found');
    //   }
    //   contribution.updated_at = new Date();
    //   const updatedIngredient = Object.assign(ingredient, contribution);

    //   return await this.ingredientRepository.save(updatedIngredient);
    // }
    // else {
    //   if (!contribution.ingredient_id) {
    //     throw new Error('No ingredient to edit');
    //   }

    //   const ingredient = await this.ingredientRepository.findOne({ where: { id: contribution.ingredient_id } });
    //   if (!ingredient) {
    //     throw new Error('Ingredient not found');
    //   }
    //   return await this.contributionIngreRepository.update(contribution.id, { deleted_at: new Date(),opt: ContributionOptions.DELETE_REQ }); // soft delete
    // }
  }

  async findAllUser(id: any): Promise<ContributionIngre[]> {
    return await this.contributionIngreRepository.find({ where: { author: id } });
  }

  async findOneUser(id: string, userId: string): Promise<ContributionIngre | null> {
    // if its theirs
    const contribution = await this.contributionIngreRepository.findOne({ where: { id } });
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    if (contribution.user_id !== userId) {
      throw new Error('You do not have access to this contribution');
    }
    return contribution;
  }

  async createUpdateContribution(
    id: string,
    updateContributionIngreDto: UpdateContributionIngreDto,
    userId: string,
  ): Promise<ContributionIngre> {
    const existingContribution = await this.contributionIngreRepository.findOne({ where: { id } });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.user_id !== userId) {
      throw new Error('You do not have access to this contribution');
    }
    if (existingContribution.status !== ContributionStatus.PENDING) {
      throw new Error('Only pending contributions can be updated');
    }
    const updatedContribution = Object.assign(existingContribution, updateContributionIngreDto); // copy existing to update but prioritize update
    updatedContribution.opt = ContributionOptions.EDIT;
    updatedContribution.status = ContributionStatus.PENDING;
    return await this.contributionIngreRepository.save(updatedContribution);
  }

  async createDeleteContribution(id: string, userId: string): Promise<ContributionIngre> {
    const existingContribution = await this.contributionIngreRepository.findOne({ where: { id } });
    if (!existingContribution) {
      throw new Error('Contribution not found');
    }
    if (existingContribution.user_id !== userId) {
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
  ): Promise<ContributionIngre> {
    const contributionIngre = this.contributionIngreRepository.create({
      ...createContributionIngreDto,
      user_id: userId,
    });
    contributionIngre.opt = ContributionOptions.NEW;
    contributionIngre.status = ContributionStatus.PENDING;
    return await this.contributionIngreRepository.save(contributionIngre);
  }

  async findAll(): Promise<ContributionIngre[]> {
    return await this.contributionIngreRepository.find();
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
