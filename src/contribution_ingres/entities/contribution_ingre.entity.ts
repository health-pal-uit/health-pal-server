import { ContributionOptions } from 'src/helpers/enums/contribution-options';
import { ContributionStatus } from 'src/helpers/enums/contribution-status.enum';
import { FoodType } from 'src/helpers/enums/food-type.enum';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
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

@Entity('contribution_ingres')
@Check(`
  COALESCE(kcal_per_100gr, 0) >= 0
  AND COALESCE(protein_per_100gr, 0) >= 0
  AND COALESCE(fat_per_100gr, 0) >= 0
  AND COALESCE(carbs_per_100gr, 0) >= 0
  AND COALESCE(fiber_per_100gr, 0) >= 0
`)
@Index('cm_status_ingre_idx', ['status'])
@Index('cm_opt_ingre_idx', ['opt'])
@Index('cm_user_ingre_idx', ['author'])
@Index('cm_created_ingre_idx', ['created_at'])
export class ContributionIngre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //author
  @ManyToOne(() => User, (u) => u.contributionsIngresAuthored, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  author: User;

  @RelationId((c: ContributionIngre) => c.author)
  user_id: string; // convenience: read-only relation id

  // reviewer
  @ManyToOne(() => User, (u) => u.contributionsIngresReviewed, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer?: User | null;

  @RelationId((c: ContributionIngre) => c.reviewer)
  reviewer_id?: string | null;

  @OneToOne(() => Ingredient, (i) => i.contribution_ingre, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient?: Ingredient | null; // the ingredient being edited/created/deleted, null if opt = NEW

  @RelationId((c: ContributionIngre) => c.ingredient)
  ingredient_id?: string | null;

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
  private _image_url?: string | null | undefined;
  public get image_url(): string | null | undefined {
    return this._image_url;
  }
  public set image_url(value: string | null | undefined) {
    this._image_url = value;
  }

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
