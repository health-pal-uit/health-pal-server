import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { ExpertRating } from 'src/expert_ratings/entities/expert_rating.entity';

export enum ConsultationStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ConsultationStatus, default: ConsultationStatus.SCHEDULED })
  status: ConsultationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  started_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at: Date | null;

  @Column({ type: 'float', nullable: true, default: 0 })
  duration_minutes: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  tokens_charged: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  // relationship => 4
  @OneToOne(() => Booking, (booking) => booking.consultation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Expert, (expert) => expert.consultations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert: Expert;

  @OneToOne(() => ChatSession, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'chat_session_id' })
  chat_session: ChatSession | null;

  @OneToOne(() => ExpertRating, (expertRating) => expertRating.consultation)
  expert_rating?: ExpertRating | null;
}
