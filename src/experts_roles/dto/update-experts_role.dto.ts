import { PartialType } from '@nestjs/mapped-types';
import { CreateExpertsRoleDto } from './create-experts_role.dto';

export class UpdateExpertsRoleDto extends PartialType(CreateExpertsRoleDto) {}
