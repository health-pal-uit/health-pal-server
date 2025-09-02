import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expert } from "src/experts/entities/expert.entity";
import { MonthlyPayment } from "src/monthly_payments/entities/monthly_payment.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum PayRecordStatus {
    PROCESSED = 'processed',
    PROCESSING = 'processing'
}

// hàm đưa và trả tiền ra vào db
export const Money = {
    to: (v?: number | null) => v,
    from: (v?: string | null) => (v==null?null:Number(v))
};

@ApiSchema({name: PayRecord.name, description: 'PayRecord entity'})
@Entity('pay_records')
export class PayRecord {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'enum', enum: PayRecordStatus})
    status: PayRecordStatus;

    @ApiProperty()
    @Column({type: 'int'})
    consultation_times: number;

    @ApiProperty()
    @Column({type: 'numeric', precision: 12, scale: 2, transformer: Money})
    total_pay_amount: number;

    // relations => 2
    @ManyToOne(() => Expert, (expert) => expert.pay_records, {eager: true})
    @JoinColumn({ name: 'expert_id' })
    expert: Expert;

    @ManyToOne(() => MonthlyPayment, (mp) => mp.pay_records, {eager: true})
    @JoinColumn({name: 'monthly_payment_id'})
    monthly_payment: MonthlyPayment;
}
