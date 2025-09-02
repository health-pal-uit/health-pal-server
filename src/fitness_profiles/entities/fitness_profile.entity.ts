import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { DietType } from "src/diet_types/entities/diet_type.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum ActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHTLY_ACTIVE = 'lightly_active',
    MODERATELY = 'moderately',
    ACTIVE = 'active',
    VERY_ACTIVE = 'very_active',
}
export enum BFP_CALCULATING_METHOD{
    BMI = 'bmi',
    US_NAVY = 'us_navy',
    YMCA = 'ymca'
}

@ApiSchema({name: FitnessProfile.name, description: 'FitnessProfile entity'})
@Entity('fitness_profiles')
export class FitnessProfile {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'float'})
    weight_kg: number;

    @ApiProperty()
    @Column({type: 'float'})
    height_m: number;

    @ApiProperty()
    @Column({type: 'float'})
    waist_cm: number;

    @ApiProperty()
    @Column({type: 'float'})
    hip_cm: number;

    @ApiProperty()
    @Column({type: 'float'})
    neck_cm: number;

    @ApiProperty({ enum: ActivityLevel })
    @Column({type: 'enum', enum: ActivityLevel})
    activity_level: ActivityLevel;

    @ApiProperty()
    @Column({type: 'float'})
    body_fat_percentages: number;

    @ApiProperty({ enum: BFP_CALCULATING_METHOD })
    @Column({type: 'enum', enum: BFP_CALCULATING_METHOD})
    body_fat_calculating_method: BFP_CALCULATING_METHOD;

    @ApiProperty()
    @Column({type: 'float'})
    bmr: number;

    @ApiProperty()
    @Column({type: 'float'})
    bmi: number;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @ApiProperty()
    @Column({type: 'float'})
    tdee_kcal: number;

    // relations => 2
    @OneToOne(() => User, user => user.fitness_profile, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => DietType, diet_type => diet_type.fitness_profiles, {onDelete: 'SET NULL'})
    @JoinColumn({name: 'diet_type_id'})
    diet_type: DietType;
}
