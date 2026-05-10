import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
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

    // sync cache if it differs
    const parsed = parseFloat(onChainBalance);
    if (parsed !== wallet.token_balance_cache) {
      await this.walletsService.updateBalanceCache(wallet.id, parsed);
    }

    return {
      address: wallet.address,
      balance: onChainBalance,
      balance_cache: parsed,
    };
  }
}
