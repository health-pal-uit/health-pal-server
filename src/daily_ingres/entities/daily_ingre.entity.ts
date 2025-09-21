import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MealType } from '../../helpers/enums/meal-type.enum';

@ApiSchema({ name: DailyIngre.name, description: 'DailyIngre entity' })
@Check(`quantity_kg > 0`)
@Check(
  `total_kcal >= 0 AND total_protein_gr >= 0 AND total_fat_gr >= 0 AND total_carbs_gr >= 0 AND total_fiber_gr >= 0`,
)
@Index('idx_daily_ingres_daily', ['daily_log'])
@Index('idx_daily_ingres_ingredient', ['ingredient'])
@Index('idx_daily_ingres_meal_type_time', ['meal_type', 'logged_at'])
@Entity('daily_ingres')
export class DailyIngre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  quantity_kg!: number;

  @Column({ type: 'float' })
  total_kcal!: number;

  @Column({ type: 'float' })
  total_protein_gr!: number;

  @Column({ type: 'float' })
  total_fat_gr!: number;

  @Column({ type: 'float' })
  total_carbs_gr!: number;

  @Column({ type: 'float' })
  total_fiber_gr!: number;

  @Column({ type: 'enum', enum: MealType })
  meal_type!: MealType;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  logged_at!: Date;

  // relations => 2
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.daily_ingres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingre_id' })
  ingredient: Ingredient;

  @ManyToOne(() => DailyLog, (dailyLog) => dailyLog.daily_ingres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_log_id' })
  daily_log: DailyLog;
}
