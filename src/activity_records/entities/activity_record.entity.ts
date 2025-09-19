import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Activity } from 'src/activities/entities/activity.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { FitnessGoal } from 'src/fitness_goals/entities/fitness_goal.entity';
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

export enum RecordType {
  DAILY = 'daily',
  GOAL = 'goal',
  CHALLENGE = 'challenge',
}

@ApiSchema({ name: ActivityRecord.name, description: 'ActivityRecord entity' })
@Check(`reps IS NULL OR reps > 0`)
@Check(`hours IS NULL OR hours > 0`)
@Check(`kcal_burned IS NULL OR kcal_burned >= 0`)
@Check(`rhr IS NULL OR rhr >= 0`)
@Check(`ahr IS NULL OR ahr >= 0`)
@Check(`intensity_level IS NULL OR (intensity_level BETWEEN 1 AND 5)`)
@Check(`num_nonnulls(daily_log_id, challenge_id, goal_id) = 1`)
@Check(`
  (type = 'daily'     AND daily_log_id  IS NOT NULL) OR
  (type = 'challenge' AND challenge_id  IS NOT NULL) OR
  (type = 'goal'      AND goal_id       IS NOT NULL)
`)
@Index('idx_ar_activity', ['activity'])
@Index('idx_ar_created', ['created_at'])
@Entity('activity_records')
export class ActivityRecord {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 10, description: 'Number of repetitions' })
  @Column({ type: 'int', nullable: true })
  reps?: number;

  @ApiProperty({ example: 1, description: 'Number of hours' })
  @Column({ type: 'float', nullable: true })
  hours?: number;

  @ApiProperty({ example: 100, description: 'Calories burned' })
  @Column({ type: 'float', nullable: true })
  kcal_burned?: number;

  @ApiProperty({ example: 60, description: 'Resting heart rate' })
  @Column({ type: 'int', nullable: true })
  rhr: number;

  @ApiProperty({ example: 70, description: 'Average heart rate' })
  @Column({ type: 'int', nullable: true })
  ahr: number;

  @ApiProperty({ example: 'daily', description: 'Type of activity record' })
  @Column({ type: 'enum', enum: RecordType })
  type: RecordType;

  @ApiProperty({ example: 3, description: 'Intensity level from 1 to 5' })
  @Column({ type: 'int', nullable: true })
  intensity_level: number;

  @ApiProperty({ example: '2023-01-01', description: 'Creation date' })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // relations => 2

  @ManyToOne(() => DailyLog, (dailyLog) => dailyLog.activity_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_log_id' })
  daily_log: DailyLog | null;

  @ManyToOne(() => Challenge, (challenge) => challenge.activity_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge | null;

  @ManyToOne(() => FitnessGoal, (fitnessGoal) => fitnessGoal.activity_records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'goal_id' })
  goal: FitnessGoal | null;

  @ManyToOne(() => Activity, (activity) => activity.activity_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;
}
