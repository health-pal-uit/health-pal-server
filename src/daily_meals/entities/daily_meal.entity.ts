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
import { MealType } from 'src/helpers/enums/meal-type.enum';

@ApiSchema({ name: DailyMeal.name, description: 'DailyMeal entity' })
@Check(`quantity_kg > 0`)
@Check(
  `total_kcal >= 0 AND total_protein_gr >= 0 AND total_fat_gr >= 0 AND total_carbs_gr >= 0 AND total_fiber_gr >= 0`,
)
@Index('idx_daily_meals_daily', ['daily_log'])
@Index('idx_daily_meals_meal', ['meal'])
@Entity('daily_meals')
export class DailyMeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', nullable: true })
  quantity_kg: number;

  @Column({ type: 'int', nullable: true })
  serving: number;

  @Column({ type: 'float' })
  total_kcal: number;

  @Column({ type: 'float' })
  total_protein_gr: number;

  @Column({ type: 'float' })
  total_fat_gr: number;

  @Column({ type: 'float' })
  total_carbs_gr: number;

  @Column({ type: 'float' })
  total_fiber_gr: number;

  @Column({ type: 'enum', enum: MealType })
  meal_type: MealType;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  logged_at: Date;

  // relations => 2
  @ManyToOne(() => Meal, (meal) => meal.daily_meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;

  @ManyToOne(() => DailyLog, (dailyLog) => dailyLog.daily_meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_log_id' })
  daily_log: DailyLog;
}
