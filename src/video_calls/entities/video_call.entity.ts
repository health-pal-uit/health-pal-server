import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Consultation } from 'src/consultations/entities/consultation.entity';
import { User } from 'src/users/entities/user.entity';
import { Expert } from 'src/experts/entities/expert.entity';

export enum VideoCallStatus {
  WAITING = 'waiting',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ENDED = 'ended',
  FAILED = 'failed',
}

@Entity('video_calls')
export class VideoCall {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VideoCallStatus, default: VideoCallStatus.WAITING })
  status: VideoCallStatus;

  @Column({ type: 'timestamptz', nullable: true })
  started_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at: Date | null;

  @Column({ type: 'float', nullable: true, default: 0 })
  duration_seconds: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // relationship => 3
  @ManyToOne(() => Consultation, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'consultation_id' })
  consultation: Consultation | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ManyToOne(() => Expert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert: Expert;
}
