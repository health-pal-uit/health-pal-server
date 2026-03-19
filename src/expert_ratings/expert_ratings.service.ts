import { Injectable } from '@nestjs/common';
import { CreateExpertRatingDto } from './dto/create-expert_rating.dto';
import { UpdateExpertRatingDto } from './dto/update-expert_rating.dto';

@Injectable()
export class ExpertRatingsService {
  create(createExpertRatingDto: CreateExpertRatingDto) {
    return 'This action adds a new expertRating';
  }

  findAll() {
    return `This action returns all expertRatings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expertRating`;
  }

  update(id: number, updateExpertRatingDto: UpdateExpertRatingDto) {
    return `This action updates a #${id} expertRating`;
  }

  remove(id: number) {
    return `This action removes a #${id} expertRating`;
  }
}
