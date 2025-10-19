import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { IsNull, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm';
import { UpdateResult } from 'typeorm';
import { ContributionIngresService } from 'src/contribution_ingres/contribution_ingres.service';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient) private ingredientRepository: Repository<Ingredient>,
    //private contributionIngresService: ContributionIngresService,
  ) {}
  // admin create
  async create(createIngredientDto: CreateIngredientDto) {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    return await this.ingredientRepository.save(ingredient);
  }
  // admin find all
  async findAll() {
    return await this.ingredientRepository.find({ where: { deleted_at: IsNull() } });
  }

  // find all verified for user
  async findAllUser() {
    return await this.ingredientRepository.find({
      where: { is_verified: true, deleted_at: IsNull() },
    });
  }
  async findOne(id: string) {
    return await this.ingredientRepository.findOne({
      where: { id },
      relations: ['contribution_ingres', 'contribution_ingres.author'],
    });
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<UpdateResult> {
    return await this.ingredientRepository.update(id, updateIngredientDto);
  }

  // async removeUser(id: string, userId: string) : Promise<any> {
  //   return await this.contributionIngresService.createDeleteContribution(id, userId);
  // }
  // async updateUser(id: string, updateIngredientDto: UpdateIngredientDto, userId: string) : Promise<any> {
  //   return await this.contributionIngresService.createUpdateContribution(id, updateIngredientDto, userId);
  // }
  async remove(id: string): Promise<DeleteResult> {
    return await this.ingredientRepository.delete(id);
  }
}
