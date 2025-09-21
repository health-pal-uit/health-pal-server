import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { FitnessProfile } from 'src/fitness_profiles/entities/fitness_profile.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DietTypeName } from 'src/helpers/enums/diet-type-name.enum';

@ApiSchema({ name: DietType.name, description: 'DietType entity' })
@Entity('diet_types')
export class DietType {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: DietTypeName, description: 'Name of the diet type' })
  @Column({ type: 'enum', enum: DietTypeName, unique: true })
  name: DietTypeName;

  @ApiProperty({ example: 20, description: 'Percentage of protein in the diet type' })
  @Column({ type: 'float' })
  protein_percentages: number;

  @ApiProperty({ example: 30, description: 'Percentage of fat in the diet type' })
  @Column({ type: 'float' })
  fat_percentages: number;

  @ApiProperty({ example: 40, description: 'Percentage of carbohydrates in the diet type' })
  @Column({ type: 'float' })
  carbs_percentages: number;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Creation date of the diet type',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // relations

  // reflects
  @ApiProperty({
    type: () => [FitnessProfile],
    description: 'List of fitness profiles associated with this diet type',
  })
  @OneToMany(() => FitnessProfile, (fitness_profile) => fitness_profile.diet_type)
  fitness_profiles: FitnessProfile[];
}
