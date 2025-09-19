import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ApiSchema({ name: IngreMeal.name, description: 'IngreMeal entity' })
@Entity('ingre_meals')
export class IngreMeal {
  @ApiProperty({ description: 'Unique identifier for the ingredient meal' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Quantity of the ingredient meal in kilograms' })
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
