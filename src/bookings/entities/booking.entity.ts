import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Consultation } from "src/consultations/entities/consultation.entity";
import { Expert } from "src/experts/entities/expert.entity";
import { User } from "src/users/entities/user.entity";
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELED = 'canceled',
    DENIED = 'denied'
}

@Check(`
  (
    (booked_by_user_id IS NOT NULL AND booked_by_expert_id IS NULL) OR
    (booked_by_user_id IS NULL AND booked_by_expert_id IS NOT NULL)
  )
`)
@Index('idx_bookings_expert_status_time', ['expert', 'status', 'scheduled_time'])
@Index('idx_bookings_user_time', ['user', 'scheduled_time'])
@ApiSchema({name: Booking.name, description: 'Booking entity'})
@Entity('bookings')
export class Booking {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: BookingStatus })
    status: BookingStatus;

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', nullable: true })
    user_confirmed_at: Date | null;

    @ApiProperty()
    @Column({ type: 'timestamptz', nullable: true })
    expert_confirmed_at: Date | null;

    @Column({ type: 'timestamptz' })
    scheduled_time!: Date;

    // relations => 4
    @ManyToOne(() => User, (user) => user.bookings, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Expert, (expert) => expert.bookings, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'expert_id', referencedColumnName: "user_id" }) // trong table expert, id chính là user_id
    expert: Expert;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'booked_by_user_id' })
    booked_by_user: User | null;

    @ManyToOne(() => Expert, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'booked_by_expert_id', referencedColumnName: "user_id" })
    booked_by_expert: Expert | null;

    // reflects
    @OneToOne(() => Consultation, (consultation) => consultation.booking)
    consultation: Consultation;

}
