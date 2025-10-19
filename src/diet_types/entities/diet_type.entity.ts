import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { FitnessProfile } from 'src/fitness_profiles/entities/fitness_profile.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ApiSchema({ name: DietType.name, description: 'DietType entity' })
@Entity('diet_types')
@Check(`"protein_percentages" + "fat_percentages" + "carbs_percentages" = 100`)
@Check(`"protein_percentages" >= 0 AND "fat_percentages" >= 0 AND "carbs_percentages" >= 0`)
export class DietType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  name: string;

  @Column({ type: 'float' })
  protein_percentages: number;

  @Column({ type: 'float' })
  fat_percentages: number;

  @Column({ type: 'float' })
  carbs_percentages: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  // relations

  // reflects
  @OneToMany(() => FitnessProfile, (fitness_profile) => fitness_profile.diet_type)
  fitness_profiles: FitnessProfile[];
}
