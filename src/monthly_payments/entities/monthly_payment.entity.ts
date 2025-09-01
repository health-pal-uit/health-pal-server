import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({type: 'numeric'})
    total_pay_amount: number;

    @ApiProperty({ enum: MonthlyPaymentStatus })
    @Column({type: 'enum', enum: MonthlyPaymentStatus})
    status: MonthlyPaymentStatus;

    @ApiProperty()
    @Column({type: 'timestamptz'})
    processed_at: Date;
}
