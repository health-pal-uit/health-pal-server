import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivityRecordsService } from './activity_records.service';
import { CreateActivityRecordDto } from './dto/create-activity_record.dto';
import { UpdateActivityRecordDto } from './dto/update-activity_record.dto';

@Controller('activity-records')
export class ActivityRecordsController {
  constructor(private readonly activityRecordsService: ActivityRecordsService) {}

  @Post()
  create(@Body() createActivityRecordDto: CreateActivityRecordDto) {
    return this.activityRecordsService.create(createActivityRecordDto);
  }

  @Get()
  findAll() {
    return this.activityRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityRecordsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityRecordDto: UpdateActivityRecordDto) {
    return this.activityRecordsService.update(+id, updateActivityRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityRecordsService.remove(+id);
  }
}
