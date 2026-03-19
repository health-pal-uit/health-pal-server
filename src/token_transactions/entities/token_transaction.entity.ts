import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';

export enum TokenTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TokenTransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('token_transactions')
export class TokenTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TokenTransactionType })
  type: TokenTransactionType;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tx_hash: string | null;

  @Column({ type: 'enum', enum: TokenTransactionStatus, default: TokenTransactionStatus.PENDING })
  status: TokenTransactionStatus;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // relationship => 1
  @ManyToOne(() => Wallet, (wallet) => wallet.token_transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;
}
