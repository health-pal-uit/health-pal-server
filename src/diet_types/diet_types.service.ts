import { Injectable } from '@nestjs/common';
import { CreateDietTypeDto } from './dto/create-diet_type.dto';
import { UpdateDietTypeDto } from './dto/update-diet_type.dto';

@Injectable()
export class DietTypesService {
  create(createDietTypeDto: CreateDietTypeDto) {
    return 'This action adds a new dietType';
  }

  findAll() {
    return `This action returns all dietTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dietType`;
  }

  update(id: number, updateDietTypeDto: UpdateDietTypeDto) {
    return `This action updates a #${id} dietType`;
  }

  remove(id: number) {
    return `This action removes a #${id} dietType`;
  }
}
