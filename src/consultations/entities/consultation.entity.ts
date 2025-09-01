import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ConsultationStatus {
    FINISHED = 'finished',
    ONGOING = 'ongoing',
    CANCELED = 'canceled'
}

@ApiSchema({name: Consultation.name, description: 'Consultation entity'})
@Entity('consultations')
export class Consultation {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'timestamptz', nullable: true})
    user_approved_at?: Date;

    @ApiProperty()
    @Column({type: 'timestamptz', nullable: true})
    admin_approved_at?: Date;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    result?: string;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    note?: string;

    @ApiProperty({ enum: ConsultationStatus })
    @Column({type: 'enum', enum: ConsultationStatus, nullable: false})
    status: ConsultationStatus;

    @ApiProperty()
    @Column({type: 'boolean', nullable: false})
    payment_status: boolean;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
