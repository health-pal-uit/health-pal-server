import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/users/entities/user.entity';
import { ethers } from 'ethers';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { TokenTransactionsService } from 'src/token_transactions/token_transactions.service';
import {
  TokenTransactionStatus,
  TokenTransactionType,
} from 'src/token_transactions/entities/token_transaction.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    private blockchainService: BlockchainService,
    private tokenTransactionsService: TokenTransactionsService,
  ) {}

  async createForUser(user: User): Promise<Wallet> {
    const { address } = ethers.Wallet.createRandom();
    const wallet = this.walletsRepository.create({
      user,
      address,
      chain_id: 'sepolia',
      token_balance_cache: 0,
    });
    return this.walletsRepository.save(wallet);
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.walletsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async updateBalanceCache(walletId: string, newBalance: number): Promise<void> {
    await this.walletsRepository.update(walletId, { token_balance_cache: newBalance });
  }

  async topup(
    userId: string,
    tokenAmount: number,
  ): Promise<{
    wallet_address: string;
    token_amount: number;
    tx_hash: string | null;
    new_balance: number;
    transaction_id: string;
  }> {
    // auto-create wallet if user somehow doesn't have one yet
    let wallet = await this.findByUserId(userId);
    if (!wallet) {
      const { address } = ethers.Wallet.createRandom();
      wallet = await this.walletsRepository.save(
        this.walletsRepository.create({
          user: { id: userId } as User,
          address,
          chain_id: 'sepolia',
          token_balance_cache: 0,
        }),
      );
    }

    // attempt on-chain mint; returns null when blockchain env vars not configured
    const txHash = await this.blockchainService.rewardUser(wallet.address, tokenAmount);

    // top-up is always recorded as SUCCESS — simulated operation by design
    const tx = await this.tokenTransactionsService.record(
      wallet,
      TokenTransactionType.CREDIT,
      tokenAmount,
      txHash,
      undefined,
      txHash ? 'Top-up (on-chain Sepolia)' : 'Top-up (off-chain simulated)',
      TokenTransactionStatus.SUCCESS,
    );

    // derive new balance: refresh from chain when available, otherwise increment cache
    let newBalance: number;
    if (txHash) {
      const onChain = await this.blockchainService.getBalance(wallet.address);
      newBalance = parseFloat(onChain);
    } else {
      newBalance = wallet.token_balance_cache + tokenAmount;
    }
    await this.updateBalanceCache(wallet.id, newBalance);

    return {
      wallet_address: wallet.address,
      token_amount: tokenAmount,
      tx_hash: txHash,
      new_balance: newBalance,
      transaction_id: tx.id,
    };
  }
}
