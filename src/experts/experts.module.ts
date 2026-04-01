import { Module } from '@nestjs/common';
import { ExpertsService } from './experts.service';
import { ExpertsController } from './experts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expert } from './entities/expert.entity';
import { User } from 'src/users/entities/user.entity';
import { ExpertRole } from 'src/expert_roles/entities/expert_role.entity';
import { Role } from 'src/roles/entities/role.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expert, User, ExpertRole, Role, PremiumPackage]),
    SupabaseStorageModule,
  ],
  controllers: [ExpertsController],
  providers: [ExpertsService],
})
export class ExpertsModule {}
