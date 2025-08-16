import { PartialType } from '@nestjs/mapped-types';
import { CreateExpertsRatingDto } from './create-experts_rating.dto';

export class UpdateExpertsRatingDto extends PartialType(CreateExpertsRatingDto) {}
