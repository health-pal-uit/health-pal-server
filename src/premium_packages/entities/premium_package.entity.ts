import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({type: 'numeric'})
    expert_fee: number;

    @ApiProperty()
    @Column({type: 'numeric'})
    price: number;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updated_at: Date;
}
