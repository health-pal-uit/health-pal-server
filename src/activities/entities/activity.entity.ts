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

export enum ActivityType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
}

@ApiSchema({ name: Activity.name, description: 'Activity entity' })
@Check(`met_value >= 0`)
@Check(`kcal_per_rep >= 0`)
@Check(`kcal_per_hour >= 0`)
@Entity('activities')
export class Activity {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Running', description: 'Name of the activity' })
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @ApiProperty({ example: 8, description: 'Metabolic equivalent of task (MET) value' })
  @Column({ type: 'float' })
  met_value: number;

  @ApiProperty({ example: 100, description: 'Calories burned per repetition' })
  @Column({ type: 'float' })
  kcal_per_rep: number;

  @ApiProperty({ example: 800, description: 'Calories burned per hour' })
  @Column({ type: 'float' })
  kcal_per_hour: number;

  @ApiProperty({ example: true, description: 'Indicates if the activity supports repetitions' })
  @Column({ type: 'boolean', default: false })
  supports_rep: boolean;

  @ApiProperty({ example: true, description: 'Indicates if the activity supports hours' })
  @Column({ type: 'boolean', default: false })
  supports_hour: boolean;

  @ApiProperty({
    example: [ActivityType.CARDIO],
    description: 'Categories the activity belongs to',
  })
  @Column({ type: 'enum', enum: ActivityType, array: true })
  categories: ActivityType[];

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the activity' })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // relations => 0

  // reflects

  @OneToMany(() => ActivityRecord, (activityRecord) => activityRecord.activity)
  activity_records: ActivityRecord[];
}
