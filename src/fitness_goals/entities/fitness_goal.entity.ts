import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FitnessGoalType } from 'src/helpers/enums/fitness-goal-type.enum';

@ApiSchema({ name: FitnessGoal.name, description: 'FitnessGoal entity' })
@Entity('fitness_goals')
export class FitnessGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  target_kcal: number;

  @Column({ type: 'int' })
  target_protein_gr: number;

  @Column({ type: 'int' })
  target_fat_gr: number;

  @Column({ type: 'int' })
  target_carbs_gr: number;

  @Column({ type: 'int' })
  target_fiber_gr: number;

  @Column({ type: 'enum', enum: FitnessGoalType })
  goal_type: FitnessGoalType;

  @Column({ type: 'float', default: 0, nullable: true })
  water_drank_l: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  // relations => 1
  @ManyToOne(() => User, (user) => user.fitness_goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // reflects

  // @OneToMany(() => ActivityRecord, (activityRecord) => activityRecord.goal)
  // activity_records: ActivityRecord[] | null;
}
