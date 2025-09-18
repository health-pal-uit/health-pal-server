import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expert } from "src/experts/entities/expert.entity";
import { Money } from "src/pay_records/entities/pay_record.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PremiumPackageName {
    FREE = 'free',
    LITE = 'lite',
    PRO = 'pro'
}

@ApiSchema({name: PremiumPackage.name, description: 'PremiumPackage entity'})
@Entity('premium_packages')
export class PremiumPackage {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'enum', enum: PremiumPackageName})
    name: PremiumPackageName;

    @ApiProperty()
    @Column({type: 'numeric', precision: 12, scale: 2, transformer: Money})
    expert_fee: number;

    @ApiProperty()
    @Column({type: 'numeric', precision: 12, scale: 2, transformer: Money})
    price: number;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // relations


    // reflects

    @OneToMany(() => Expert, (expert) => expert.booking_fee_tier)
    experts: Expert[];

    @OneToMany(() => User, (user) => user.premiumPackage)
    users: User[];
}
