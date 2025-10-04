import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseAdminModule } from 'src/supabase/supabase-admin.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [SupabaseAdminModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
