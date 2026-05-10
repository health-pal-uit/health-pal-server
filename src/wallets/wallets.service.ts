import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(@InjectRepository(Wallet) private walletsRepository: Repository<Wallet>) {}

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
