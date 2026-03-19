import { PartialType } from '@nestjs/swagger';
import { CreateExpertRoleDto } from './create-expert_role.dto';

export class UpdateExpertRoleDto extends PartialType(CreateExpertRoleDto) {}
