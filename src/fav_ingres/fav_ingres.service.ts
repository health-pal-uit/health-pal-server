import { Injectable } from '@nestjs/common';
import { CreateFavIngreDto } from './dto/create-fav_ingre.dto';
import { UpdateFavIngreDto } from './dto/update-fav_ingre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FavIngre } from './entities/fav_ingre.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FavIngresService {
  constructor(
    @InjectRepository(FavIngre) private favIngreRepository: Repository<FavIngre>,
    @InjectRepository(Ingredient) private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async remove(id: string): Promise<FavIngre | null> {
    if (!id || id === 'undefined') {
      return null;
    }
    const favIngre = await this.favIngreRepository.findOne({ where: { id } });
    if (!favIngre) {
      return null;
    }
    await this.favIngreRepository.delete(id);
    return favIngre;
  }

  async removeByUserAndIngredient(userId: string, ingredientId: string): Promise<FavIngre | null> {
    const favIngre = await this.favIngreRepository.findOne({
      where: {
        user: { id: userId },
        ingredient: { id: ingredientId },
      },
    });
    await this.favIngreRepository.delete({
      user: { id: userId },
      ingredient: { id: ingredientId },
    });
    return favIngre;
  }
  async findAllOfUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: { id: string; ingredient: Ingredient }[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [favIngre, total] = await this.favIngreRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['ingredient'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    const data = favIngre.map((fav) => ({ id: fav.id, ingredient: fav.ingredient }));
    return { data, total, page, limit };
  }
  async create(createFavIngreDto: CreateFavIngreDto) {
    // Validate UUIDs before querying database
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (
      !uuidRegex.test(createFavIngreDto.ingredient_id) ||
      !uuidRegex.test(createFavIngreDto.user_id)
    ) {
      throw new Error('Invalid ingredient or user ID');
    }

    const user = await this.userRepository.findOne({ where: { id: createFavIngreDto.user_id } });
    const ingredient = await this.ingredientRepository.findOne({
      where: { id: createFavIngreDto.ingredient_id },
    });
    if (!user || !ingredient) {
      throw new Error('User or Ingredient not found');
    }
    // Check for duplicate
    const existing = await this.favIngreRepository.findOne({
      where: { user: { id: user.id }, ingredient: { id: ingredient.id } },
    });
    if (existing) {
      throw new Error('Already favorited');
    }
    const favIngre = this.favIngreRepository.create();
    favIngre.user = user;
    favIngre.ingredient = ingredient;
    return this.favIngreRepository.save(favIngre);
  }

  async isFavorited(userId: string, ingredientId: string): Promise<boolean> {
    const fav = await this.favIngreRepository.findOne({
      where: { user: { id: userId }, ingredient: { id: ingredientId } },
    });
    return !!fav;
  }
}
