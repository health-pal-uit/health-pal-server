import { Controller } from '@nestjs/common';
import { TokenTransactionsService } from './token_transactions.service';

@Controller('token-transactions')
export class TokenTransactionsController {
  constructor(private readonly tokenTransactionsService: TokenTransactionsService) {}
}
