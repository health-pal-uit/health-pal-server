import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { DeleteResult, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string): Promise<Role | null> {
    return await this.roleRepository.findOneBy({ id });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<UpdateResult> {
    return await this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.roleRepository.softDelete(id);
  }
}
