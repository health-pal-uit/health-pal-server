import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { IsNull, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm';
import { UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient) private ingredientRepository: Repository<Ingredient>,
    //private contributionIngresService: ContributionIngresService,
    private supabaseStorageService: SupabaseStorageService,
    private configService: ConfigService,
  ) {}
  // admin create
  async create(
    createIngredientDto: CreateIngredientDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<Ingredient> {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    if (imageBuffer && imageName) {
      const bucketName =
        this.configService.get<string>('INGREDIENT_IMG_BUCKET_NAME') || 'ingredient-imgs';
      const imagePath = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      ingredient.image_url = imagePath;
    }
    return await this.ingredientRepository.save(ingredient);
  }
  // admin find all
  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Ingredient[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.ingredientRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  // find all verified for user
  async findAllUser(
    page = 1,
    limit = 10,
  ): Promise<{ data: Ingredient[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.ingredientRepository.findAndCount({
      where: { is_verified: true, deleted_at: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }
  async findOne(id: string) {
    return await this.ingredientRepository.findOne({
      where: { id },
      relations: ['contribution_ingres', 'contribution_ingres.author'],
    });
  }

  async findOneUser(id: string) {
    return await this.ingredientRepository.findOne({
      where: { id, is_verified: true, deleted_at: IsNull() },
    });
  }

  async update(
    id: string,
    updateIngredientDto: UpdateIngredientDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<UpdateResult> {
    if (imageBuffer && imageName) {
      const bucketName =
        this.configService.get<string>('INGREDIENT_IMG_BUCKET_NAME') || 'ingredient-imgs';
      const imagePath = await this.supabaseStorageService.uploadImageFromBuffer(
        imageBuffer,
        imageName,
        bucketName,
      );
      updateIngredientDto.image_url = imagePath;
    }
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
