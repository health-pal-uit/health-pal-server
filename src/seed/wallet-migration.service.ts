import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { ethers } from 'ethers';

@Injectable()
export class WalletMigrationService {
  private readonly logger = new Logger(WalletMigrationService.name);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Wallet) private walletsRepo: Repository<Wallet>,
  ) {}

  async run(): Promise<void> {
    const usersWithoutWallet = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoin('user.wallet', 'wallet')
      .where('wallet.id IS NULL')
      .andWhere('user.deactivated_at IS NULL')
      .getMany();

    if (usersWithoutWallet.length === 0) {
      this.logger.log('All users already have wallets');
      return;
    }

    this.logger.log(`Creating wallets for ${usersWithoutWallet.length} existing users...`);

    for (const user of usersWithoutWallet) {
      const { address } = ethers.Wallet.createRandom();
      const wallet = this.walletsRepo.create({
        user,
        address,
        chain_id: 'sepolia',
        token_balance_cache: 0,
      });
      await this.walletsRepo.save(wallet);
      this.logger.log(`Created wallet for user ${user.id}`);
    }

    this.logger.log('Wallet migration complete');
  }
}
