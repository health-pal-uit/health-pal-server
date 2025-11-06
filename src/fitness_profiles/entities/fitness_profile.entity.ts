import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DietType } from 'src/diet_types/entities/diet_type.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityLevel } from 'src/helpers/enums/activity-level.enum';
import { BFPCalculatingMethod } from 'src/helpers/enums/bfp-calculating-method.enum';

@ApiSchema({ name: FitnessProfile.name, description: 'FitnessProfile entity' })
@Entity('fitness_profiles')
export class FitnessProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  weight_kg: number;

  @Column({ type: 'float' })
  height_m: number;

  @Column({ type: 'float', nullable: true })
  waist_cm: number;

  @Column({ type: 'float', nullable: true })
  hip_cm: number;

  @Column({ type: 'float', nullable: true })
  neck_cm: number;

  @Column({ type: 'enum', enum: ActivityLevel })
  activity_level: ActivityLevel;

  @Column({ type: 'float', nullable: true })
  body_fat_percentages: number;

  @Column({
    type: 'enum',
    enum: BFPCalculatingMethod,
    default: BFPCalculatingMethod.BMI,
    nullable: true,
  })
  body_fat_calculating_method: BFPCalculatingMethod;

  @Column({ type: 'float' })
  bmr: number;

  @Column({ type: 'float' })
  bmi: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'float' })
  tdee_kcal: number;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  // relations => 2
  @ManyToOne(() => User, (user) => user.fitness_profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DietType, (diet_type) => diet_type.fitness_profiles, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'diet_type_id' })
  diet_type: DietType;
}
