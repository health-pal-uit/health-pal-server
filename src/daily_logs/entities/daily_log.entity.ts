import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: DailyLog.name, description: 'DailyLog entity'})
@Entity('daily_logs')
export class DailyLog {
    @ApiProperty({description: 'Unique identifier for the daily log'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({description: 'Date of the daily log'})
    @Column({type: 'date'})
    date: Date;

    @ApiProperty({description: 'Total calories consumed on the daily log'})
    @Column({type: 'float'})
    total_kcal: number;

    @ApiProperty({description: 'Total protein consumed on the daily log'})
    @Column({type: 'float'})
    total_protein_gr: number;

    @ApiProperty({description: 'Total fat consumed on the daily log'})
    @Column({type: 'float'})
    total_fat_gr: number;

    @ApiProperty({description: 'Total carbohydrates consumed on the daily log'})
    @Column({type: 'float'})
    total_carbs_gr: number;

    @ApiProperty({description: 'Total fiber consumed on the daily log'})
    @Column({type: 'float'})
    total_fiber_gr: number;

    @ApiProperty({description: 'Total water consumed on the daily log'})
    @Column({type: 'float'})
    water_drank_l: number;

    @ApiProperty({description: 'Date when the daily log was last updated'})
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updated_at: Date;
}
