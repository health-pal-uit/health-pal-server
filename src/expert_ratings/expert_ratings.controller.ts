import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpertRatingsService } from './expert_ratings.service';
import { CreateExpertRatingDto } from './dto/create-expert_rating.dto';
import { UpdateExpertRatingDto } from './dto/update-expert_rating.dto';

@Controller('expert-ratings')
export class ExpertRatingsController {
  constructor(private readonly expertRatingsService: ExpertRatingsService) {}

  @Post()
  create(@Body() createExpertRatingDto: CreateExpertRatingDto) {
    return this.expertRatingsService.create(createExpertRatingDto);
  }

  @Get()
  findAll() {
    return this.expertRatingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertRatingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpertRatingDto: UpdateExpertRatingDto) {
    return this.expertRatingsService.update(+id, updateExpertRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertRatingsService.remove(+id);
  }
}
