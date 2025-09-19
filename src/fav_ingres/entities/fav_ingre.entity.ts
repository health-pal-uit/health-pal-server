import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@ApiSchema({ name: FavIngre.name, description: 'FavIngre entity' })
@Unique(['user', 'ingredient'])
@Entity('fav_ingres')
export class FavIngre {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  id: string;

  // relations => 2
  @ManyToOne(() => User, (user) => user.fav_ingres)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.fav_ingres)
  @JoinColumn({ name: 'ingre_id' })
  ingredient: Ingredient;
}
