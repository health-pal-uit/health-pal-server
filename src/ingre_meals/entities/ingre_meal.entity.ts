import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Meal } from '../../meals/entities/meal.entity';

@Entity('ingre_meals')
export class IngreMeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 10, scale: 3, nullable: true })
  quantity_kg: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.ingre_meals)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @ManyToOne(() => Meal, (meal) => meal.ingre_meals)
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;
}
