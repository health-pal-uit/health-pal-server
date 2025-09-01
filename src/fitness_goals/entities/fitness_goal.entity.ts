import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum FitnessGoalType {
    CUT = 'cut',
    BULK = 'bulk',
    MAINTAIN = 'maintain',
    RECOVERY = 'recovery',
    GAIN_MUSCLES = 'gain_muscles'
}

@ApiSchema({name: FitnessGoal.name, description: 'FitnessGoal entity'})
@Entity('fitness_goals')
export class FitnessGoal {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'int'})
    target_kcal: number;

    @ApiProperty()
    @Column({type: 'int'})
    target_protein_gr: number;

    @ApiProperty()
    @Column({type: 'int'})
    target_fat_gr: number;

    @ApiProperty()
    @Column({type: 'int'})
    target_carbs_gr: number;

    @ApiProperty()
    @Column({type: 'int'})
    target_fiber_gr: number;

    @ApiProperty({ enum: FitnessGoalType })
    @Column({type: 'enum', enum: FitnessGoalType})
    goal_type: FitnessGoalType;

    @ApiProperty()
    @Column({type: 'float'})
    water_drank_l: number;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
