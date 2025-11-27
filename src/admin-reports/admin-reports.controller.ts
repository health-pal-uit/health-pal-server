import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminReportsService } from './admin-reports.service';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { AdminReportQueryDto } from './dto/admin-report-query.dto';

@ApiTags('admin-reports')
@ApiBearerAuth()
@Controller('admin-reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Run admin analytics/report',
    description:
      'Returns overview totals and time-series for the selected metric (default: overview of key metrics).',
  })
  @ApiResponse({ status: 200, description: 'Aggregated report data returned successfully' })
  async getReport(@Query() query: AdminReportQueryDto) {
    return await this.adminReportsService.getReport(query);
  }
}
