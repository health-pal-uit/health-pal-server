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
@Check(`kcal_per_rep >= 0`)
@Check(`kcal_per_hour >= 0`)
@Entity('activities')
@Check(
  `(supports_rep = false AND kcal_per_rep IS NULL) OR (supports_rep = true AND kcal_per_rep IS NOT NULL)`,
)
@Check(
  `(supports_hour = false AND kcal_per_hour IS NULL) OR (supports_hour = true AND kcal_per_hour IS NOT NULL)`,
)
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'float' })
  met_value: number;

  @Column({ type: 'float', nullable: true })
  kcal_per_rep?: number;

  @Column({ type: 'float', nullable: true })
  kcal_per_hour?: number;

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
