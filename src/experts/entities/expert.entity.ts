import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Check, Column, Entity, PrimaryColumn } from "typeorm";

export enum AccStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@ApiSchema({name: Expert.name, description: 'Expert entity'})
@Check(`"avg_rating" >= 0 AND "avg_rating" <= 5`)
@Entity('experts')
export class Expert {
    @ApiProperty()
    @PrimaryColumn()
    user_id: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: AccStatus })
    status: AccStatus;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    license_url: string; // @IsUrl() in dto

    @ApiProperty()
    @Column({ name: 'citizenId', type: 'char', length: 12, unique: true })
    identity_id!: string;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    identity_url: string;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    face_image_url: string;

    @ApiProperty()
    @Column({type: 'float', default: 0})
    avg_rating: number;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    joined_at: Date;
}
