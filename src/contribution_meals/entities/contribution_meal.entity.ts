import { Delete } from '@nestjs/common';
import { IsOptional } from 'class-validator';
import { ContributionOptions } from 'src/helpers/enums/contribution-options';
import { ContributionStatus } from 'src/helpers/enums/contribution-status.enum';
import { ContributionType } from 'src/helpers/enums/contribution-type.enum';
import { FoodType } from 'src/helpers/enums/food-type.enum';
import { Meal } from 'src/meals/entities/meal.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contribution_meals')
@Check(`
  COALESCE(kcal_per_100gr, 0) >= 0
  AND COALESCE(protein_per_100gr, 0) >= 0
  AND COALESCE(fat_per_100gr, 0) >= 0
  AND COALESCE(carbs_per_100gr, 0) >= 0
  AND COALESCE(fiber_per_100gr, 0) >= 0
`)
@Check(`COALESCE(serving_gr, 0) >= 0`)
@Index('cm_status_meal_idx', ['status'])
@Index('cm_opt_meal_idx', ['opt'])
@Index('cm_user_meal_idx', ['author'])
@Index('cm_created_meal_idx', ['created_at'])
export class ContributionMeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //author
  @ManyToOne(() => User, (u) => u.contributionsMealsAuthored, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  author: User;

  @RelationId((c: ContributionMeal) => c.author)
  user_id: string; // convenience: read-only relation id

  // reviewer
  @ManyToOne(() => User, (u) => u.contributionsMealsReviewed, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer?: User | null;

  @RelationId((c: ContributionMeal) => c.reviewer)
  reviewer_id?: string | null;

  @OneToOne(() => Meal, (m) => m.contribution_meal, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'meal_id' })
  meal?: Meal | null; // the meal being edited/created/deleted, null if opt = NEW

  @RelationId((c: ContributionMeal) => c.meal)
  meal_id?: string | null;

  // --- Payload fields ---
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'float', nullable: true })
  serving_gr?: number | null;

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

  @Column({ type: 'enum', enum: ContributionOptions, default: ContributionOptions.NEW })
  opt: ContributionOptions;

  @Column({ type: 'timestamptz', nullable: true })
  reviewed_at?: Date | null;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string | null;

  // --- Timestamps ---
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;
}
