import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RecordType {
    DAILY = 'daily',
    GOAL = 'goal',
    CHALLENGE = 'challenge'
}

@ApiSchema({name: ActivityRecord.name, description: 'ActivityRecord entity'})
@Entity('activity_records')
export class ActivityRecord {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 10, description: 'Number of repetitions'})
    @Column({type: 'int', nullable: true})
    reps?: number;

    @ApiProperty({example: 1, description: 'Number of hours'})
    @Column({type: 'float', nullable: true})
    hours?: number;

    @ApiProperty({example: 100, description: 'Calories burned'})
    @Column({type: 'float', nullable: true})
    kcal_burned?: number;

    @ApiProperty({example: 60, description: 'Resting heart rate'})
    @Column({type: 'int', nullable: true})
    rhr: number;

    @ApiProperty({example: 70, description: 'Average heart rate'})
    @Column({type: 'int', nullable: true})
    ahr: number;

    @ApiProperty({example: 'daily', description: 'Type of activity record'})
    @Column({type: 'enum', enum: RecordType})
    type: RecordType;

    @ApiProperty({example: 3, description: 'Intensity level from 1 to 5'})
    @Column({type: 'int', nullable: true})
    intensity_level: number;

    @ApiProperty({example: '2023-01-01', description: 'Creation date'})
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

}
