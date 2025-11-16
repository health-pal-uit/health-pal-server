import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { DailyIngre } from 'src/daily_ingres/entities/daily_ingre.entity';
import { DailyMeal } from 'src/daily_meals/entities/daily_meal.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@ApiSchema({ name: DailyLog.name, description: 'DailyLog entity' })
@Check(
  `total_protein_gr >= 0 AND total_fat_gr >= 0 AND total_carbs_gr >= 0 AND total_fiber_gr >= 0 AND water_drank_l >= 0`,
)
@Unique('UQ_daily_logs_user_date', ['user', 'date'])
@Index('idx_daily_logs_user_date', ['user', 'date'])
@Entity('daily_logs')
export class DailyLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'float', default: 0 })
  total_kcal_eaten: number;

  @Column({ type: 'float', default: 0 })
  total_kcal: number; // from food + exercise

  @Column({ type: 'float', default: 0 })
  total_kcal_burned: number;

  @Column({ type: 'float', default: 0 })
  total_protein_gr: number;

  @Column({ type: 'float', default: 0 })
  total_fat_gr: number;

  @Column({ type: 'float', default: 0 })
  total_carbs_gr: number;

  @Column({ type: 'float', default: 0 })
  total_fiber_gr: number;

  @Column({ type: 'float', default: 0 })
  water_drank_l: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // relations => 1
  @ManyToOne(() => User, (user) => user.daily_logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // reflects
  @OneToMany(() => DailyIngre, (dailyIngre) => dailyIngre.daily_log)
  daily_ingres: DailyIngre[];

  @OneToMany(() => DailyMeal, (dailyMeal) => dailyMeal.daily_log)
  daily_meals: DailyMeal[];

  @OneToMany(() => ActivityRecord, (activityRecord) => activityRecord.daily_log)
  activity_records: ActivityRecord[] | null;
}
