import { Injectable } from '@nestjs/common';
import { CreateFavIngreDto } from './dto/create-fav_ingre.dto';
import { UpdateFavIngreDto } from './dto/update-fav_ingre.dto';

@Injectable()
export class FavIngresService {
  create(createFavIngreDto: CreateFavIngreDto) {
    return 'This action adds a new favIngre';
  }

  findAll() {
    return `This action returns all favIngres`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favIngre`;
  }

  update(id: number, updateFavIngreDto: UpdateFavIngreDto) {
    return `This action updates a #${id} favIngre`;
  }

  remove(id: number) {
    return `This action removes a #${id} favIngre`;
  }
}
