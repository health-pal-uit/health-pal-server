import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DailyMeal } from 'src/daily_meals/entities/daily_meal.entity';
import { FavMeal } from 'src/fav_meals/entities/fav_meal.entity';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FoodType } from 'src/helpers/enums/food-type.enum';

@ApiSchema({ name: Meal.name, description: 'Meal entity' })
@Check(`rating >= 0 AND rating <= 5`)
@Check(
  `kcal_per_100g >= 0 AND protein_per_100g >= 0 AND fat_per_100g >= 0 AND carbs_per_100g >= 0 AND fiber_per_100g >= 0`,
)
@Entity('meals')
export class Meal {
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

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'enum', enum: FoodType, array: true })
  tags: FoodType[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  // relations => 0

  // reflects
  @OneToMany(() => IngreMeal, (ingreMeal) => ingreMeal.meal)
  ingre_meals: IngreMeal[];

  @OneToMany(() => DailyMeal, (dailyMeal) => dailyMeal.meal)
  daily_meals: DailyMeal[];

  @OneToMany(() => FavMeal, (favMeal) => favMeal.meal)
  fav_meals: FavMeal[];
}
