import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FitnessGoalType } from 'src/helpers/enums/fitness-goal-type.enum';

@ApiSchema({ name: FitnessGoal.name, description: 'FitnessGoal entity' })
@Entity('fitness_goals')
export class FitnessGoal {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'int' })
  target_kcal: number;

  @ApiProperty()
  @Column({ type: 'int' })
  target_protein_gr: number;

  @ApiProperty()
  @Column({ type: 'int' })
  target_fat_gr: number;

  @ApiProperty()
  @Column({ type: 'int' })
  target_carbs_gr: number;

  @ApiProperty()
  @Column({ type: 'int' })
  target_fiber_gr: number;

  @ApiProperty({ enum: FitnessGoalType })
  @Column({ type: 'enum', enum: FitnessGoalType })
  goal_type: FitnessGoalType;

  @ApiProperty()
  @Column({ type: 'float' })
  water_drank_l: number;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // relations => 1
  @ManyToOne(() => User, (user) => user.fitness_goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // reflects

  @OneToMany(() => ActivityRecord, (activityRecord) => activityRecord.goal)
  activity_records: ActivityRecord[] | null;
}
