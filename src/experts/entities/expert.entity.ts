import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ExpertRole } from 'src/expert_roles/entities/expert_role.entity';
import { ExpertRating } from 'src/expert_ratings/entities/expert_rating.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Consultation } from 'src/consultations/entities/consultation.entity';

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'float', default: 0 })
  token_per_minute: number;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_online: boolean;

  @Column({ type: 'float', default: 0 })
  rating_avg: number;

  @Column({ type: 'int', default: 0 })
  rating_count: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  // relationship => 5
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ExpertRole, (expertRole) => expertRole.experts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'expert_role_id' })
  expert_role: ExpertRole;

  @OneToMany(() => ExpertRating, (expertRating) => expertRating.expert)
  expert_ratings: ExpertRating[];

  @OneToMany(() => Booking, (booking) => booking.expert)
  bookings: Booking[];

  @OneToMany(() => Consultation, (consultation) => consultation.expert)
  consultations: Consultation[];
}
