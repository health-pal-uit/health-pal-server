import { Injectable } from '@nestjs/common';
import { CreateMedalDto } from './dto/create-medal.dto';
import { UpdateMedalDto } from './dto/update-medal.dto';

@Injectable()
export class MedalsService {
  create(createMedalDto: CreateMedalDto) {
    return 'This action adds a new medal';
  }

  findAll() {
    return `This action returns all medals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medal`;
  }

  update(id: number, updateMedalDto: UpdateMedalDto) {
    return `This action updates a #${id} medal`;
  }

  remove(id: number) {
    return `This action removes a #${id} medal`;
  }
}
