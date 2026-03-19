import { Injectable } from '@nestjs/common';
import { CreateExpertRoleDto } from './dto/create-expert_role.dto';
import { UpdateExpertRoleDto } from './dto/update-expert_role.dto';

@Injectable()
export class ExpertRolesService {
  create(createExpertRoleDto: CreateExpertRoleDto) {
    return 'This action adds a new expertRole';
  }

  findAll() {
    return `This action returns all expertRoles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expertRole`;
  }

  update(id: number, updateExpertRoleDto: UpdateExpertRoleDto) {
    return `This action updates a #${id} expertRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} expertRole`;
  }
}
