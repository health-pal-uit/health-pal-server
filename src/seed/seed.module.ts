import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { WalletMigrationService } from './wallet-migration.service';
import { User } from 'src/users/entities/user.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet])],
  providers: [SeedService, WalletMigrationService],
  exports: [SeedService, WalletMigrationService],
})
export class SeedModule {}
