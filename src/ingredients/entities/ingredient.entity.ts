import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DailyIngre } from 'src/daily_ingres/entities/daily_ingre.entity';
import { FavIngre } from 'src/fav_ingres/entities/fav_ingre.entity';
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
import { FoodType } from '../../helpers/enums/food-type.enum';
import { ContributionIngre } from 'src/contribution_ingres/entities/contribution_ingre.entity';
import { Post } from 'src/posts/entities/post.entity';

@ApiSchema({ name: Ingredient.name, description: 'Ingredient entity' })
@Check(
  `kcal_per_100gr >= 0 AND protein_per_100gr >= 0 AND fat_per_100gr >= 0 AND carbs_per_100gr >= 0 AND fiber_per_100gr >= 0`,
)
@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'float' })
  kcal_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  protein_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  fat_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  carbs_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  fiber_per_100gr: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: FoodType, array: true, nullable: true, default: [] })
  tags: FoodType[];

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  // relations => 0

  // reflects
  @OneToMany(() => IngreMeal, (ingreMeal) => ingreMeal.ingredient)
  ingre_meals: IngreMeal[];

  @OneToMany(() => DailyIngre, (dailyIngre) => dailyIngre.ingredient)
  daily_ingres: DailyIngre[];

  @OneToMany(() => FavIngre, (favIngre) => favIngre.ingredient)
  fav_ingres: FavIngre[];

  // contributions => optional
  @OneToOne(() => ContributionIngre, (contributionIngre) => contributionIngre.ingredient)
  contribution_ingre?: ContributionIngre;

  @OneToMany(() => Post, (post) => post.attach_ingredient)
  posts: Post[];
}
