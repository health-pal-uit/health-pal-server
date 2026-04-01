import { Module } from '@nestjs/common';
import { ExpertRolesService } from './expert_roles.service';
import { ExpertRolesController } from './expert_roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertRole } from './entities/expert_role.entity';
import { Expert } from 'src/experts/entities/expert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertRole, Expert])],
  controllers: [ExpertRolesController],
  providers: [ExpertRolesService],
})
export class ExpertRolesModule {}
