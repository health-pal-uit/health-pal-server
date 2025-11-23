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
  async remove(id: string): Promise<DeleteResult> {
    return await this.favIngreRepository.delete(id);
  }

  async removeByUserAndIngredient(userId: string, ingredientId: string): Promise<DeleteResult> {
    return await this.favIngreRepository.delete({
      user: { id: userId },
      ingredient: { id: ingredientId },
    });
  }
  async findAllOfUser(userId: string): Promise<{ id: string; ingredient: Ingredient }[]> {
    const favIngre = await this.favIngreRepository.find({
      where: { user: { id: userId } },
      relations: ['ingredient'],
    });
    return favIngre.map((fav) => ({ id: fav.id, ingredient: fav.ingredient }));
  }
  async create(createFavIngreDto: CreateFavIngreDto) {
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
