import { Injectable } from '@nestjs/common';
import { CreateDailyIngreDto } from './dto/create-daily_ingre.dto';
import { UpdateDailyIngreDto } from './dto/update-daily_ingre.dto';

@Injectable()
export class DailyIngresService {
  create(createDailyIngreDto: CreateDailyIngreDto) {
    return 'This action adds a new dailyIngre';
  }

  findAll() {
    return `This action returns all dailyIngres`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dailyIngre`;
  }

  update(id: number, updateDailyIngreDto: UpdateDailyIngreDto) {
    return `This action updates a #${id} dailyIngre`;
  }

  remove(id: number) {
    return `This action removes a #${id} dailyIngre`;
  }
}
