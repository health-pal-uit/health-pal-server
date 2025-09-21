import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PremiumPackageName } from 'src/helpers/enums/premium-package-name.enum';
import { Money } from 'src/helpers/transformers/money.transformer';

@ApiSchema({ name: PremiumPackage.name, description: 'PremiumPackage entity' })
@Entity('premium_packages')
export class PremiumPackage {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: PremiumPackageName })
  name: PremiumPackageName;

  @ApiProperty()
  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: Money })
  expert_fee: number;

  @ApiProperty()
  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: Money })
  price: number;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // relations

  // reflects
  @OneToMany(() => User, (user) => user.premiumPackage)
  users: User[];
}
