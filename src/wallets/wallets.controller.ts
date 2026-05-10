import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { TokenTransactionsService } from 'src/token_transactions/token_transactions.service';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import type { ReqUserType } from 'src/auth/types/req.type';

@ApiTags('wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly blockchainService: BlockchainService,
    private readonly tokenTransactionsService: TokenTransactionsService,
  ) {}

  @Get('balance')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get current user token balance' })
  @ApiResponse({ status: 200, description: 'Returns wallet address and token balance' })
  async getMyBalance(@CurrentUser() user: ReqUserType) {
    const wallet = await this.walletsService.findByUserId(user.id);
    if (!wallet) {
      return { address: null, balance: '0', balance_cache: 0 };
    }

    const onChainBalance = await this.blockchainService.getBalance(wallet.address);
    const parsed = parseFloat(onChainBalance);
    if (parsed !== wallet.token_balance_cache) {
      await this.walletsService.updateBalanceCache(wallet.id, parsed);
    }

    return { address: wallet.address, balance: onChainBalance, balance_cache: parsed };
  }

  @Get('transactions')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get current user token transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated transaction history' })
  async getMyTransactions(
    @CurrentUser() user: ReqUserType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.tokenTransactionsService.findByUserId(user.id, page, limit);
  }
}
