import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DailyMeal } from 'src/daily_meals/entities/daily_meal.entity';
import { FavMeal } from 'src/fav_meals/entities/fav_meal.entity';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FoodType } from 'src/helpers/enums/food-type.enum';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ContributionMeal } from 'src/contribution_meals/entities/contribution_meal.entity';
import { Post } from 'src/posts/entities/post.entity';

@ApiSchema({ name: Meal.name, description: 'Meal entity' })
@Check(`rating >= 0 AND rating <= 5`)
@Check(
  `kcal_per_100gr >= 0 AND protein_per_100gr >= 0 AND fat_per_100gr >= 0 AND carbs_per_100gr >= 0 AND fiber_per_100gr >= 0`,
)
// @Check(`(made_from_ingredients IS TRUE AND ingre_meals IS NOT NULL) OR (made_from_ingredients IS FALSE AND ingre_meals IS NULL)`) // uhh maybe wrong?
@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ApiProperty({ example: 100, description: 'Serving size in grams' })
  @IsOptional()
  @IsNumber()
  serving_gr?: number;

  @Column({ type: 'float', nullable: true })
  kcal_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  protein_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  fat_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  carbs_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  fiber_per_100gr: number;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'enum', enum: FoodType, array: true, nullable: true })
  tags: FoodType[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  made_from_ingredients: boolean;

  // relations => 0

  // reflects
  @OneToMany(() => IngreMeal, (ingreMeal) => ingreMeal.meal)
  ingre_meals: IngreMeal[];

  @OneToMany(() => DailyMeal, (dailyMeal) => dailyMeal.meal)
  daily_meals: DailyMeal[];

  @OneToMany(() => FavMeal, (favMeal) => favMeal.meal)
  fav_meals: FavMeal[];

  @OneToOne(() => ContributionMeal, (contributionMeal) => contributionMeal.meal)
  contribution_meal?: ContributionMeal;

  @OneToMany(() => Post, (post) => post.attach_meal)
  posts: Post[];
}
