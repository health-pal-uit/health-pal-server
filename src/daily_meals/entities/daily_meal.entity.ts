import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MealType } from 'src/daily_ingres/meal-type.enum';

@ApiSchema({ name: DailyMeal.name, description: 'DailyMeal entity' })
@Check(`quantity_kg > 0`)
@Check(
  `total_kcal >= 0 AND total_protein_gr >= 0 AND total_fat_gr >= 0 AND total_carbs_gr >= 0 AND total_fiber_gr >= 0`,
)
@Index('idx_daily_meals_daily', ['daily_log'])
@Index('idx_daily_meals_meal', ['meal'])
@Entity('daily_meals')
export class DailyMeal {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 1, description: 'Quantity in kg' })
  @Column({ type: 'float' })
  quantity_kg: number;

  @ApiProperty({ example: 250, description: 'Total calories' })
  @Column({ type: 'float' })
  total_kcal: number;

  @ApiProperty({ example: 30, description: 'Total protein in grams' })
  @Column({ type: 'float' })
  total_protein_gr: number;

  @ApiProperty({ example: 10, description: 'Total fat in grams' })
  @Column({ type: 'float' })
  total_fat_gr: number;

  @ApiProperty({ example: 100, description: 'Total carbohydrates in grams' })
  @Column({ type: 'float' })
  total_carbs_gr: number;

  @ApiProperty({ example: 5, description: 'Total fiber in grams' })
  @Column({ type: 'float' })
  total_fiber_gr: number;

  @ApiProperty({ example: 'breakfast', description: 'Meal type', enum: MealType })
  @Column({ type: 'enum', enum: MealType })
  meal_type: MealType;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Logged at' })
  @CreateDateColumn({ type: 'timestamptz' })
  logged_at: Date;

  // relations => 2
  @ManyToOne(() => Meal, (meal) => meal.daily_meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;

  @ManyToOne(() => DailyLog, (dailyLog) => dailyLog.daily_meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_log_id' })
  daily_log: DailyLog;
}
