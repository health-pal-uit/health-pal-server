import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Check, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

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
@Index(['expert', 'status', 'scheduledTime'])
@Index(['user', 'scheduledTime'])
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
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', nullable: true })
    user_confirmed_at: Date | null;

    @ApiProperty()
    @Column({ type: 'timestamptz', nullable: true })
    expert_confirmed_at: Date | null;

    @Column({ type: 'timestamptz' })
    scheduled_time!: Date;

}
