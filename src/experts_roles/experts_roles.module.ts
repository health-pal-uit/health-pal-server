import { Module } from '@nestjs/common';
import { ExpertsRolesService } from './experts_roles.service';
import { ExpertsRolesController } from './experts_roles.controller';

@Module({
  controllers: [ExpertsRolesController],
  providers: [ExpertsRolesService],
})
export class ExpertsRolesModule {}
