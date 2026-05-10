import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';
import { SupabaseAdminProvider } from 'src/supabase/supabase-admin.provider';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule, SupabaseStorageModule, WalletsModule],
  controllers: [UsersController],
  providers: [UsersService, SupabaseAdminProvider],
  exports: [UsersService],
})
export class UsersModule {}
