import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Activity } from 'src/activities/entities/activity.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { FitnessGoal } from 'src/fitness_goals/entities/fitness_goal.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecordType } from 'src/helpers/enums/record-type.enum';
import { User } from 'src/users/entities/user.entity';

@ApiSchema({ name: ActivityRecord.name, description: 'ActivityRecord entity' })
@Check(`duration_minutes IS NULL OR duration_minutes > 0`)
@Check(`kcal_burned IS NULL OR kcal_burned >= 0`)
@Check(`intensity_level IS NULL OR (intensity_level BETWEEN 1 AND 5)`)
@Check(`num_nonnulls(daily_log_id, challenge_id) = 1`)
@Check(`
  (type = 'daily'     AND daily_log_id  IS NOT NULL) OR
  (type = 'challenge' AND challenge_id  IS NOT NULL)
`)
@Index('idx_ar_activity', ['activity'])
@Index('idx_ar_created', ['created_at'])
@Entity('activity_records')
export class ActivityRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', nullable: true })
  duration_minutes?: number;

  @Column({ type: 'float', nullable: true })
  kcal_burned?: number;

  @Column({ type: 'int', nullable: true })
  rhr?: number;

  @Column({ type: 'int', nullable: true })
  ahr?: number;

  @Column({ type: 'boolean', nullable: false })
  user_owned: boolean;

  @Column({ type: 'enum', enum: RecordType })
  type: RecordType;

  @Column({ type: 'int', nullable: true })
  intensity_level: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  // relations => 2

  @ManyToOne(() => DailyLog, (dailyLog) => dailyLog.activity_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_log_id' })
  daily_log: DailyLog | null;

  @ManyToOne(() => Challenge, (challenge) => challenge.activity_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge | null;

  @ManyToOne(() => Activity, (activity) => activity.activity_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;
}
