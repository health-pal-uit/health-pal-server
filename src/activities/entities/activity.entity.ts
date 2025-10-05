import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityType } from 'src/helpers/enums/activity-type.enum';

@ApiSchema({ name: Activity.name, description: 'Activity entity' })
@Check(`met_value >= 0`)
@Entity('activities')
@Check(
  `(supports_rep = false AND supports_hour = true) OR (supports_rep = true AND supports_hour = false)`,
)
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'float' })
  met_value: number;

  @Column({ type: 'boolean', default: false })
  supports_rep: boolean;

  @Column({ type: 'boolean', default: false })
  supports_hour: boolean;

  @Column({ type: 'enum', enum: ActivityType, array: true })
  categories: ActivityType[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // relations => 0

  // reflects

  @OneToMany(() => ActivityRecord, (activityRecord) => activityRecord.activity)
  activity_records: ActivityRecord[];
}

// kcal_burned = met_value × 3.5 × user_weight_kg / 200 × (hours × 60)
// kcal_per_rep = (met_value × 3.5 × user_weight_kg / 200) × (1 / avg_reps_per_minute)
// kcal_per_hour = (met_value × 3.5 × user_weight_kg / 200) * 60
