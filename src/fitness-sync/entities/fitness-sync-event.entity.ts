import { ApiSchema } from '@nestjs/swagger';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FitnessSyncRecordType, FitnessSyncSource } from '../dto/sync-fitness-record.dto';

@ApiSchema({ name: FitnessSyncEvent.name, description: 'Stores synced external fitness records' })
@Entity('fitness_sync_events')
@Index('uq_fitness_sync_identity', ['user', 'source', 'record_type', 'external_record_id'], {
  unique: true,
})
export class FitnessSyncEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: FitnessSyncSource })
  source: FitnessSyncSource;

  @Column({ type: 'enum', enum: FitnessSyncRecordType })
  record_type: FitnessSyncRecordType;

  @Column({ type: 'varchar', length: 255 })
  external_record_id: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ActivityRecord, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'activity_record_id' })
  activity_record: ActivityRecord | null;
}
