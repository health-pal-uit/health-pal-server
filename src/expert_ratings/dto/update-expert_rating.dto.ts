import { PartialType } from '@nestjs/swagger';
import { CreateExpertRatingDto } from './create-expert_rating.dto';

export class UpdateExpertRatingDto extends PartialType(CreateExpertRatingDto) {}
