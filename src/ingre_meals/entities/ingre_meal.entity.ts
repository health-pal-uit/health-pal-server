import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ApiSchema({ name: IngreMeal.name, description: 'IngreMeal entity' })
@Entity('ingre_meals')
export class IngreMeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  quantity_kg: number;

  // relations => 2
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.ingre_meals)
  @JoinColumn({ name: 'ingre_id' })
  ingredient: Ingredient;

  @ManyToOne(() => Meal, (meal) => meal.ingre_meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;
}
