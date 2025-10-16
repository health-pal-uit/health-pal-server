import { Module } from '@nestjs/common';
import { FavIngresService } from './fav_ingres.service';
import { FavIngresController } from './fav_ingres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavIngre } from './entities/fav_ingre.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavIngre, Ingredient, User])],
  controllers: [FavIngresController],
  providers: [FavIngresService],
})
export class FavIngresModule {}
