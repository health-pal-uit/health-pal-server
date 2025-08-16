import { Injectable } from '@nestjs/common';
import { CreateExpertsRatingDto } from './dto/create-experts_rating.dto';
import { UpdateExpertsRatingDto } from './dto/update-experts_rating.dto';

@Injectable()
export class ExpertsRatingsService {
  create(createExpertsRatingDto: CreateExpertsRatingDto) {
    return 'This action adds a new expertsRating';
  }

  findAll() {
    return `This action returns all expertsRatings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expertsRating`;
  }

  update(id: number, updateExpertsRatingDto: UpdateExpertsRatingDto) {
    return `This action updates a #${id} expertsRating`;
  }

  remove(id: number) {
    return `This action removes a #${id} expertsRating`;
  }
}
