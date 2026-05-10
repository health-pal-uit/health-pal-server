import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TokenTransaction,
  TokenTransactionStatus,
  TokenTransactionType,
} from './entities/token_transaction.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';

@Injectable()
export class TokenTransactionsService {
  constructor(
    @InjectRepository(TokenTransaction)
    private repo: Repository<TokenTransaction>,
  ) {}

  async record(
    wallet: Wallet,
    type: TokenTransactionType,
    amount: number,
    txHash: string | null,
    referenceId?: string,
    note?: string,
  ): Promise<TokenTransaction> {
    const tx = this.repo.create({
      wallet,
      type,
      amount,
      tx_hash: txHash,
      status: txHash ? TokenTransactionStatus.SUCCESS : TokenTransactionStatus.FAILED,
      reference_id: referenceId ?? null,
      note: note ?? null,
    });
    return this.repo.save(tx);
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: TokenTransaction[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.repo.findAndCount({
      where: { wallet: { user: { id: userId } } },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
