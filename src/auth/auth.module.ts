import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseAdminModule } from 'src/supabase/supabase-admin.module';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './strategies/supabase-strategy';
import { GoogleStrategy } from './strategies/google-strategy';

@Module({
  imports: [
    SupabaseAdminModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'supabase' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseStrategy, GoogleStrategy],
  exports: [AuthService, PassportModule, SupabaseStrategy, GoogleStrategy],
})
export class AuthModule {}
