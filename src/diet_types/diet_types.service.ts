import { Injectable } from '@nestjs/common';
import { CreateDietTypeDto } from './dto/create-diet_type.dto';
import { UpdateDietTypeDto } from './dto/update-diet_type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { DietType } from './entities/diet_type.entity';

@Injectable()
export class DietTypesService {
  constructor(@InjectRepository(DietType) private dietTypeRepository: Repository<DietType>) {}

  async create(createDietTypeDto: CreateDietTypeDto): Promise<DietType> {
    const dietType = this.dietTypeRepository.create(createDietTypeDto);
    return await this.dietTypeRepository.save(dietType);
  }

  async findAll(): Promise<DietType[]> {
    return await this.dietTypeRepository.find();
  }

  async findOne(id: string): Promise<DietType | null> {
    return await this.dietTypeRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateDietTypeDto: UpdateDietTypeDto): Promise<UpdateResult> {
    return await this.dietTypeRepository.update(id, updateDietTypeDto);
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.dietTypeRepository.softDelete(id);
  }
}
