import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Booking } from "src/bookings/entities/booking.entity";
import { ChatSession } from "src/chat_sessions/entities/chat_session.entity";
import { ExpertsRating } from "src/experts_ratings/entities/experts_rating.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    // relations => 2
    @OneToOne(() => Booking, (booking) => booking.consultation, {eager: true, onDelete: 'SET NULL'})
    @JoinColumn({name: 'booking_id'})
    booking: Booking;

    @OneToOne(() => ChatSession, (chat_session) => chat_session.consultation, {eager: true, onDelete: 'SET NULL'})
    chat_session: ChatSession;

    // reflects
    @OneToOne(() => ExpertsRating, (experts_rating) => experts_rating.consultation)
    experts_rating: ExpertsRating;
}
