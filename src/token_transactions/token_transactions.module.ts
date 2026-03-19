import { Module } from '@nestjs/common';
import { TokenTransactionsService } from './token_transactions.service';
import { TokenTransactionsController } from './token_transactions.controller';

@Module({
  controllers: [TokenTransactionsController],
  providers: [TokenTransactionsService],
})
export class TokenTransactionsModule {}
