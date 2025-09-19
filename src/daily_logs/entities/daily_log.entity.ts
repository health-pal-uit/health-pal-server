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
  `total_kcal >= 0 AND total_protein_gr >= 0 AND total_fat_gr >= 0 AND total_carbs_gr >= 0 AND total_fiber_gr >= 0 AND water_drank_l >= 0`,
)
@Unique('UQ_daily_logs_user_date', ['user', 'date'])
@Index('idx_daily_logs_user_date', ['user', 'date'])
@Entity('daily_logs')
export class DailyLog {
  @ApiProperty({ description: 'Unique identifier for the daily log' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Date of the daily log' })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({ description: 'Total calories consumed on the daily log' })
  @Column({ type: 'float' })
  total_kcal: number;

  @ApiProperty({ description: 'Total protein consumed on the daily log' })
  @Column({ type: 'float' })
  total_protein_gr: number;

  @ApiProperty({ description: 'Total fat consumed on the daily log' })
  @Column({ type: 'float' })
  total_fat_gr: number;

  @ApiProperty({ description: 'Total carbohydrates consumed on the daily log' })
  @Column({ type: 'float' })
  total_carbs_gr: number;

  @ApiProperty({ description: 'Total fiber consumed on the daily log' })
  @Column({ type: 'float' })
  total_fiber_gr: number;

  @ApiProperty({ description: 'Total water consumed on the daily log' })
  @Column({ type: 'float' })
  water_drank_l: number;

  @ApiProperty({ description: 'Date when the daily log was last updated' })
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
