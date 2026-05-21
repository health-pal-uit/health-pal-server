import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { ILike, IsNull, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm';
import { UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { RedisService } from 'src/cache/redis.service';

const INGREDIENT_SEARCH_TTL = 600; // 10 min

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient) private ingredientRepository: Repository<Ingredient>,
    //private contributionIngresService: ContributionIngresService,
    private supabaseStorageService: SupabaseStorageService,
    private configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async searchByName(
    name: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Ingredient[]; total: number; page: number; limit: number }> {
    const cacheKey = `ingredients:search:${encodeURIComponent(name)}:${page}:${limit}`;
    const cached = await this.redisService.get<{
      data: Ingredient[];
      total: number;
      page: number;
      limit: number;
    }>(cacheKey);
    if (cached) return cached;

    const [data, total] = await this.ingredientRepository.findAndCount({
      where: {
        name: ILike(`%${name}%`),
        is_verified: true,
        deleted_at: IsNull(),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    const result = { data, total, page, limit };
    await this.redisService.set(cacheKey, result, INGREDIENT_SEARCH_TTL);
    return result;
  }

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
  ): Promise<Ingredient | null> {
    // handle image upload if provided
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

    // only update if there are fields to update
    if (Object.keys(updateIngredientDto).length > 0) {
      await this.ingredientRepository.update(id, updateIngredientDto);
    }
    // return with all fields
    return await this.ingredientRepository.findOne({ where: { id } });
  }

  // async removeUser(id: string, userId: string) : Promise<any> {
  //   return await this.contributionIngresService.createDeleteContribution(id, userId);
  // }
  // async updateUser(id: string, updateIngredientDto: UpdateIngredientDto, userId: string) : Promise<any> {
  //   return await this.contributionIngresService.createUpdateContribution(id, updateIngredientDto, userId);
  // }
  async remove(id: string): Promise<Ingredient | null> {
    const ingredient = await this.ingredientRepository.findOne({ where: { id } });
    if (!ingredient) {
      return null;
    }
    await this.ingredientRepository.softDelete(id);
    // Query builder to get soft-deleted entity with all fields
    const deleted = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.id = :id', { id })
      .withDeleted()
      .getOne();
    return deleted;
  }

  async restore(id: string): Promise<Ingredient | null> {
    await this.ingredientRepository.restore(id);
    return this.ingredientRepository.findOne({
      where: { id },
    });
  }
}
