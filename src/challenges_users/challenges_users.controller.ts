import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChallengesUsersService } from './challenges_users.service';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import type { ReqUserType } from 'src/auth/types/req.type';

@ApiTags('challenges-users')
@ApiBearerAuth()
@Controller('challenges-users')
export class ChallengesUsersController {
  constructor(private readonly challengesUsersService: ChallengesUsersService) {}

  @ApiOperation({ summary: 'Get all finished challenges for the current user' })
  @ApiResponse({ status: 200, description: 'Returns list of finished challenges with metadata' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('finish')
  @UseGuards(SupabaseGuard)
  async checkFinishedChallenges(@CurrentUser() user: ReqUserType) {
    return await this.challengesUsersService.checkFinishedChallenges(user.id);
  }

  @ApiOperation({ summary: 'Mark a challenge as finished for the current user' })
  @ApiResponse({ status: 201, description: 'Challenge marked as finished successfully' })
  @ApiResponse({ status: 404, description: 'Challenge or User not found' })
  @ApiResponse({ status: 409, description: 'Challenge already finished by this user' })
  @Post(':challengeId/finish')
  @UseGuards(SupabaseGuard)
  async finishChallenge(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.challengesUsersService.finishChallenge(challengeId, user.id);
  }
}
