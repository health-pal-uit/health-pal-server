import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/users/entities/user.entity';
import { ethers } from 'ethers';

@Injectable()
export class WalletsService {
  constructor(@InjectRepository(Wallet) private walletsRepository: Repository<Wallet>) {}

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
}
