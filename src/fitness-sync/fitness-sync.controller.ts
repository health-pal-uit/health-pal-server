import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { SyncFitnessRecordsBatchDto } from './dto/sync-fitness-record.dto';
import { FitnessSyncService } from './fitness-sync.service';

type AuthenticatedUserPayload = {
  id: string;
};

@ApiTags('fitness-sync')
@ApiBearerAuth('Authenticate')
@Controller('fitness-sync')
@UseGuards(SupabaseGuard)
export class FitnessSyncController {
  constructor(private readonly fitnessSyncService: FitnessSyncService) {}

  @Post('connect')
  @ApiOperation({
    summary: 'Mark Health Connect as connected',
    description:
      'Called by mobile app after Android Health Connect permissions are granted successfully.',
  })
  @ApiOkResponse({ description: 'Connect status.' })
  async connect(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.fitnessSyncService.connect(user.id);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get Health Connect sync status',
    description:
      'Returns whether Health Connect sync is currently enabled for the authenticated user and when it was last synced.',
  })
  @ApiOkResponse({ description: 'Returns connection status and last sync timestamp.' })
  async status(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.fitnessSyncService.getConnectionStatus(user.id);
  }

  @Delete('disconnect')
  @ApiOperation({
    summary: 'Disconnect Health Connect sync',
    description: 'Marks Health Connect integration as disconnected for this user.',
  })
  @ApiOkResponse({ description: 'Disconnect status.' })
  async disconnect(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.fitnessSyncService.disconnect(user.id);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Sync records from Health Connect',
    description: 'Client pushes a batch of records read from Health Connect on device.',
  })
  @ApiBody({ type: SyncFitnessRecordsBatchDto })
  @ApiOkResponse({ description: 'Batch sync results.' })
  async syncData(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: SyncFitnessRecordsBatchDto,
  ) {
    return this.fitnessSyncService.syncManually(user.id, dto);
  }
}
