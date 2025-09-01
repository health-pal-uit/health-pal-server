import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum PayRecordStatus {
    PENDING = 'processing',
    COMPLETED = 'paid',
}

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
    @Column({type: 'numeric'})
    total_pay_amount: number;
}
