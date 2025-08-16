import { Injectable } from '@nestjs/common';
import { CreateExpertsRoleDto } from './dto/create-experts_role.dto';
import { UpdateExpertsRoleDto } from './dto/update-experts_role.dto';

@Injectable()
export class ExpertsRolesService {
  create(createExpertsRoleDto: CreateExpertsRoleDto) {
    return 'This action adds a new expertsRole';
  }

  findAll() {
    return `This action returns all expertsRoles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expertsRole`;
  }

  update(id: number, updateExpertsRoleDto: UpdateExpertsRoleDto) {
    return `This action updates a #${id} expertsRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} expertsRole`;
  }
}
