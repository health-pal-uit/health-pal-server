import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminSupabaseGuard } from './auth/guards/supabase/admin-supabase.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  @UseGuards(AdminSupabaseGuard)
  test(): string {
    return 'Test endpoint is working!';
  }
}
