import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Booking } from "src/bookings/entities/booking.entity";
import { ExpertsRating } from "src/experts_ratings/entities/experts_rating.entity";
import { ExpertsRole } from "src/experts_roles/entities/experts_role.entity";
import { PayRecord } from "src/pay_records/entities/pay_record.entity";
import { PremiumPackage } from "src/premium_packages/entities/premium_package.entity";
import { User } from "src/users/entities/user.entity";
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

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
    @PrimaryColumn('uuid')
    user_id: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: AccStatus })
    status: AccStatus;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    license_url: string; // @IsUrl() in dto

    @ApiProperty()
    @Column({ type: 'char', length: 12, unique: true })
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

    // relations => 3

    @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => PremiumPackage, (pkg) => pkg.experts, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT', // or 'SET NULL'
    })
    @JoinColumn({ name: 'booking_fee_tier_id' })
    booking_fee_tier: PremiumPackage;

    @ManyToOne(() => ExpertsRole, (role) => role.experts, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT', // or 'SET NULL'
    })
    @JoinColumn({ name: 'role_id' })
    role: ExpertsRole;

    // reflects

    @OneToMany(() => ExpertsRating, (rating) => rating.expert)
    expert_ratings: ExpertsRating[];

    @OneToMany(() => Booking, (booking) => booking.expert)
    bookings: Booking[];

    @OneToMany(() => PayRecord, (pay_record) => pay_record.expert)
    pay_records: PayRecord[];
}
