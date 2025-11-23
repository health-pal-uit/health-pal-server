import { Injectable } from '@nestjs/common';
import { CreateDietTypeDto } from './dto/create-diet_type.dto';
import { UpdateDietTypeDto } from './dto/update-diet_type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { DietType } from './entities/diet_type.entity';

@Injectable()
export class DietTypesService {
  constructor(@InjectRepository(DietType) private dietTypeRepository: Repository<DietType>) {}

  async create(createDietTypeDto: CreateDietTypeDto): Promise<DietType> {
    const dietType = this.dietTypeRepository.create(createDietTypeDto);
    return await this.dietTypeRepository.save(dietType);
  }

  async findAll(): Promise<DietType[]> {
    return await this.dietTypeRepository.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string): Promise<DietType | null> {
    return await this.dietTypeRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
  }

  async findDeleted(): Promise<DietType[]> {
    return await this.dietTypeRepository.find({ where: { deleted_at: Not(IsNull()) } });
  }

  async restore(id: string): Promise<UpdateResult> {
    return await this.dietTypeRepository.restore(id);
  }

  async isReferenced(id: string): Promise<boolean> {
    // Check if any fitness profile references this diet type
    const count = await this.dietTypeRepository.manager.count('FitnessProfile', {
      where: { diet_type: { id } },
    });
    return count > 0;
  }

  async update(id: string, updateDietTypeDto: UpdateDietTypeDto): Promise<UpdateResult> {
    return await this.dietTypeRepository.update(id, updateDietTypeDto);
  }

  async remove(id: string): Promise<UpdateResult | { error: string }> {
    if (await this.isReferenced(id)) {
      return { error: 'Cannot delete: DietType is still referenced by FitnessProfile(s).' };
    }
    return await this.dietTypeRepository.softDelete(id);
  }
}
