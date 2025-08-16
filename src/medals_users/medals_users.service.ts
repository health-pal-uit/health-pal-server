import { Injectable } from '@nestjs/common';
import { CreateMedalsUserDto } from './dto/create-medals_user.dto';
import { UpdateMedalsUserDto } from './dto/update-medals_user.dto';

@Injectable()
export class MedalsUsersService {
  create(createMedalsUserDto: CreateMedalsUserDto) {
    return 'This action adds a new medalsUser';
  }

  findAll() {
    return `This action returns all medalsUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medalsUser`;
  }

  update(id: number, updateMedalsUserDto: UpdateMedalsUserDto) {
    return `This action updates a #${id} medalsUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} medalsUser`;
  }
}
