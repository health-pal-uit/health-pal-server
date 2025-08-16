import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpertsRatingsService } from './experts_ratings.service';
import { CreateExpertsRatingDto } from './dto/create-experts_rating.dto';
import { UpdateExpertsRatingDto } from './dto/update-experts_rating.dto';

@Controller('experts-ratings')
export class ExpertsRatingsController {
  constructor(private readonly expertsRatingsService: ExpertsRatingsService) {}

  @Post()
  create(@Body() createExpertsRatingDto: CreateExpertsRatingDto) {
    return this.expertsRatingsService.create(createExpertsRatingDto);
  }

  @Get()
  findAll() {
    return this.expertsRatingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsRatingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpertsRatingDto: UpdateExpertsRatingDto) {
    return this.expertsRatingsService.update(+id, updateExpertsRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertsRatingsService.remove(+id);
  }
}
