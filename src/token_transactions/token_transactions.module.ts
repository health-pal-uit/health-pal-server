import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenTransactionsService } from './token_transactions.service';
import { TokenTransactionsController } from './token_transactions.controller';
import { TokenTransaction } from './entities/token_transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TokenTransaction])],
  controllers: [TokenTransactionsController],
  providers: [TokenTransactionsService],
  exports: [TokenTransactionsService],
})
export class TokenTransactionsModule {}
