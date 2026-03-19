import { Module } from '@nestjs/common';
import { ExpertRolesService } from './expert_roles.service';
import { ExpertRolesController } from './expert_roles.controller';

@Module({
  controllers: [ExpertRolesController],
  providers: [ExpertRolesService],
})
export class ExpertRolesModule {}
