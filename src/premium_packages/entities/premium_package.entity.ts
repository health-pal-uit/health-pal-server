import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Money } from 'src/helpers/transformers/money.transformer';

@ApiSchema({ name: PremiumPackage.name, description: 'PremiumPackage entity' })
@Entity('premium_packages')
export class PremiumPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: Money })
  expert_fee: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: Money })
  price: number;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  // relations

  // reflects
  @OneToMany(() => User, (user) => user.premium_package)
  users: User[];
}
