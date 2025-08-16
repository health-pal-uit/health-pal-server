import { Injectable } from '@nestjs/common';
import { CreateFitnessProfileDto } from './dto/create-fitness_profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness_profile.dto';

@Injectable()
export class FitnessProfilesService {
  create(createFitnessProfileDto: CreateFitnessProfileDto) {
    return 'This action adds a new fitnessProfile';
  }

  findAll() {
    return `This action returns all fitnessProfiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fitnessProfile`;
  }

  update(id: number, updateFitnessProfileDto: UpdateFitnessProfileDto) {
    return `This action updates a #${id} fitnessProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} fitnessProfile`;
  }
}
