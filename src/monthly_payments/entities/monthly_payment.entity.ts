import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Money, PayRecord } from "src/pay_records/entities/pay_record.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum MonthlyPaymentStatus {
    PROCESSED = 'processed',
    PROCESSING = 'processing'
}

@ApiSchema({name: MonthlyPayment.name, description: 'MonthlyPayment entity'})
@Entity('monthly_payments')
export class MonthlyPayment {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'date'})
    process_date: Date;

    @ApiProperty()
    @Column({type: 'numeric', precision: 12, scale: 2, transformer: Money})
    total_pay_amount: number;

    @ApiProperty({ enum: MonthlyPaymentStatus })
    @Column({type: 'enum', enum: MonthlyPaymentStatus})
    status: MonthlyPaymentStatus;

    @ApiProperty()
    @Column({type: 'timestamptz'})
    processed_at: Date;

    // relations

    // reflects

    @OneToMany(() => PayRecord, (pay_record) => pay_record.monthly_payment)
    pay_records: PayRecord[];
}
