import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Tier{
    BACHELOR = 'bachelor',
    MASTER = 'master',
    DOCTOR = 'doctor',
    PROFESSOR = 'professor'
}

@ApiSchema({name: ExpertsRole.name, description: 'ExpertsRole entity'})
@Entity('experts_roles')
export class ExpertsRole {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'varchar', length: 255, unique: true})
    name: string;

    @ApiProperty()
    @Column({type: 'enum', enum: Tier, default: Tier.BACHELOR})
    tier: Tier;

    @ApiProperty()
    @Column({type: 'float', default: 1})
    weight: number;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
