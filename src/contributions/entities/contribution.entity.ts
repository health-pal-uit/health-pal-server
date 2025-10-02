import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { FoodType } from '../../helpers/enums/food-type.enum';
import { User } from 'src/users/entities/user.entity';
import { ContributionStatus } from '../../helpers/enums/contribution-status.enum';
import { ContributionType } from '../../helpers/enums/contribution-type.enum';

@ApiSchema({
  name: 'Contribution',
  description: 'User-submitted ingredient/meal awaiting moderation',
})
@Check(`
  kcal_per_100gr >= 0
  AND COALESCE(protein_per_100gr, 0) >= 0
  AND COALESCE(fat_per_100gr, 0) >= 0
  AND COALESCE(carbs_per_100gr, 0) >= 0
  AND COALESCE(fiber_per_100gr, 0) >= 0
`)
@Entity('contributions')
@Index('contrib_status_idx', ['status'])
@Index('contrib_type_idx', ['type'])
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ContributionType })
  type: ContributionType;

  // Polymorphic target (ingredient OR meal) – keep as raw UUID in MVP
  @Column({ type: 'uuid', nullable: true })
  target_id?: string | null;

  // --- Relations: Author & Reviewer (users) ---
  @ManyToOne(() => User, (u) => u.contributionsAuthored, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  author: User;

  @RelationId((c: Contribution) => c.author)
  user_id: string; // convenience: read-only relation id

  @ManyToOne(() => User, (u) => u.contributionsReviewed, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer?: User | null;

  @RelationId((c: Contribution) => c.reviewer)
  reviewer_id?: string | null;

  // --- Payload fields ---
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'float' })
  kcal_per_100gr: number;

  @Column({ type: 'float', nullable: true })
  fat_per_100gr?: number | null;

  @Column({ type: 'float', nullable: true })
  fiber_per_100gr?: number | null;

  @Column({ type: 'float', nullable: true })
  protein_per_100gr?: number | null;

  @Column({ type: 'float', nullable: true })
  carbs_per_100gr?: number | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'enum', enum: FoodType, array: true, nullable: true })
  tags?: FoodType[] | null;

  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  // --- Moderation ---
  @Column({ type: 'enum', enum: ContributionStatus, default: ContributionStatus.PENDING })
  status: ContributionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  reviewed_at?: Date | null;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string | null;

  // --- Timestamps ---
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: Date | null;
}
