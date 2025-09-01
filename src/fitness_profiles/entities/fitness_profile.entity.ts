import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @ApiProperty()
    @Column({type: 'float'})
    tdee_kcal: number;
}
