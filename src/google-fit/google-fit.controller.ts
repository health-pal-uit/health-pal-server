import { Controller, Delete, Get, Query, Res, UseGuards } from '@nestjs/common';
import { GoogleFitService } from './google-fit.service';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('google-fit')
export class GoogleFitController {
  constructor(
    private readonly googleFitService: GoogleFitService,
    private readonly configService: ConfigService,
  ) {}

  @Get('connect')
  @UseGuards(SupabaseGuard) // Only this route needs auth
  async connect(@CurrentUser() user: any, @Res() res: any) {
    const authUrl = await this.googleFitService.getAuthorizationUrl(user.id);
    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') authCode: string, @Query('state') userId: string, @Res() res: any) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const result = await this.googleFitService.connectGoogleFit(userId, authCode);
    if (!result) {
      return res.redirect(`${frontendUrl}/settings?success=false`); // fe failure url
    }
    return res.redirect(`${frontendUrl}/settings?success=true`); // fe success url
  }

  @Get('status')
  @UseGuards(SupabaseGuard)
  async status(@CurrentUser() user: any) {
    const userId = user.id;
    const isConnected = await this.googleFitService.getConnectionStatus(userId);
    return { connected: isConnected };
  }

  @Delete('disconnect')
  @UseGuards(SupabaseGuard)
  async disconnect(@CurrentUser() user: any) {
    const userId = user.id;
    const result = await this.googleFitService.disconnectGoogleFit(userId);
    return { message: 'Google Fit disconnected successfully', success: result };
  }

  @Get('sync') // sync manually
  @UseGuards(SupabaseGuard)
  async syncData(@CurrentUser() user: any, @Query('days') days?: number) {
    const daysBack = days || 7; // default last 7 days

    const end = new Date();
    const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const syncResult = await this.googleFitService.syncGoogleFitData(user.id, start, end, 86400000); // daily buckets
    return { message: 'Google Fit data synchronized successfully', details: syncResult };
  }
}
