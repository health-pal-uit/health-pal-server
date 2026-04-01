import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpertRoleDto } from './dto/create-expert_role.dto';
import { UpdateExpertRoleDto } from './dto/update-expert_role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { ExpertRole } from './entities/expert_role.entity';
import { Expert } from 'src/experts/entities/expert.entity';

@Injectable()
export class ExpertRolesService {
  constructor(
    @InjectRepository(ExpertRole)
    private readonly expertRoleRepository: Repository<ExpertRole>,
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
  ) {}

  async create(createExpertRoleDto: CreateExpertRoleDto): Promise<ExpertRole> {
    const existing = await this.expertRoleRepository.findOne({
      where: {
        name: ILike(createExpertRoleDto.name),
        deleted_at: IsNull(),
      },
    });

    if (existing) {
      throw new ConflictException('Expert role name already exists');
    }

    const expertRole = this.expertRoleRepository.create({
      ...createExpertRoleDto,
      can_do_video: createExpertRoleDto.can_do_video ?? false,
      description: createExpertRoleDto.description ?? null,
    });

    return await this.expertRoleRepository.save(expertRole);
  }

  async findAll(): Promise<ExpertRole[]> {
    return await this.expertRoleRepository.find({
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ExpertRole> {
    const expertRole = await this.expertRoleRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!expertRole) {
      throw new NotFoundException('Expert role not found');
    }

    return expertRole;
  }

  async update(id: string, updateExpertRoleDto: UpdateExpertRoleDto): Promise<ExpertRole> {
    await this.findOne(id);

    if (updateExpertRoleDto.name) {
      const duplicate = await this.expertRoleRepository.findOne({
        where: {
          id: Not(id),
          name: ILike(updateExpertRoleDto.name),
          deleted_at: IsNull(),
        },
      });

      if (duplicate) {
        throw new ConflictException('Expert role name already exists');
      }
    }

    await this.expertRoleRepository.update(id, {
      ...updateExpertRoleDto,
      ...(updateExpertRoleDto.description !== undefined
        ? { description: updateExpertRoleDto.description ?? null }
        : {}),
    });

    return await this.findOne(id);
  }

  async remove(id: string): Promise<ExpertRole> {
    const expertRole = await this.findOne(id);

    const referencedExperts = await this.expertRepository.count({
      where: {
        expert_role: { id },
        deleted_at: IsNull(),
      },
    });

    if (referencedExperts > 0) {
      throw new BadRequestException(
        'Cannot delete expert role because it is still referenced by expert records',
      );
    }

    await this.expertRoleRepository.softDelete(id);

    const deleted = await this.expertRoleRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    return deleted ?? { ...expertRole, deleted_at: new Date() };
  }
}
