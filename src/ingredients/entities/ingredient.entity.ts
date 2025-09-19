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
import { FoodType } from '../food-type.enum';

@ApiSchema({ name: Ingredient.name, description: 'Ingredient entity' })
@Check(
  `kcal_per_100g >= 0 AND protein_per_100g >= 0 AND fat_per_100g >= 0 AND carbs_per_100g >= 0 AND fiber_per_100g >= 0`,
)
@Entity('ingredients')
export class Ingredient {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Chicken Breast', description: 'Name of the ingredient' })
  @Column({ type: 'varchar', unique: true })
  name: string; // unique

  @ApiProperty({ example: 165, description: 'Calories per 100g' })
  @Column({ type: 'float' })
  kcal_per_100g: number;

  @ApiProperty({ example: 31, description: 'Protein per 100g' })
  @Column({ type: 'float' })
  protein_per_100g: number;

  @ApiProperty({ example: 5, description: 'Fat per 100g' })
  @Column({ type: 'float' })
  fat_per_100g: number;

  @ApiProperty({ example: 0, description: 'Carbohydrates per 100g' })
  @Column({ type: 'float' })
  carbs_per_100g: number;

  @ApiProperty({ example: 0, description: 'Fiber per 100g' })
  @Column({ type: 'float' })
  fiber_per_100g: number;

  @ApiProperty({
    example: 'Notes about the ingredient',
    description: 'Additional notes about the ingredient',
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ example: [FoodType.MEAT], description: 'Tags for the ingredient' })
  @Column({ type: 'enum', enum: FoodType, array: true })
  tags: FoodType[];

  @ApiProperty({ example: true, description: 'Indicates if the ingredient is verified' })
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Image URL of the ingredient',
  })
  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the ingredient' })
  @CreateDateColumn({ type: 'timestamptz' })
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
