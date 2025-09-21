import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DailyIngre } from 'src/daily_ingres/entities/daily_ingre.entity';
import { FavIngre } from 'src/fav_ingres/entities/fav_ingre.entity';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FoodType } from '../../helpers/enums/food-type.enum';

@ApiSchema({ name: Ingredient.name, description: 'Ingredient entity' })
@Check(
  `kcal_per_100g >= 0 AND protein_per_100g >= 0 AND fat_per_100g >= 0 AND carbs_per_100g >= 0 AND fiber_per_100g >= 0`,
)
@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'float' })
  kcal_per_100g: number;

  @Column({ type: 'float' })
  protein_per_100g: number;

  @Column({ type: 'float' })
  fat_per_100g: number;

  @Column({ type: 'float' })
  carbs_per_100g: number;

  @Column({ type: 'float' })
  fiber_per_100g: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: FoodType, array: true })
  tags: FoodType[];

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // relations => 0

  // reflects
  @OneToMany(() => IngreMeal, (ingreMeal) => ingreMeal.ingredient)
  ingre_meals: IngreMeal[];

  @OneToMany(() => DailyIngre, (dailyIngre) => dailyIngre.ingredient)
  daily_ingres: DailyIngre[];

  @OneToMany(() => FavIngre, (favIngre) => favIngre.ingredient)
  fav_ingres: FavIngre[];
}
