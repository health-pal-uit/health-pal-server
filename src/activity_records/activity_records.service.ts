import { Injectable } from '@nestjs/common';
import { CreateActivityRecordDto } from './dto/create-activity_record.dto';
import { UpdateActivityRecordDto } from './dto/update-activity_record.dto';

@Injectable()
export class ActivityRecordsService {
  create(createActivityRecordDto: CreateActivityRecordDto) {
    return 'This action adds a new activityRecord';
  }

  findAll() {
    return `This action returns all activityRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityRecord`;
  }

  update(id: number, updateActivityRecordDto: UpdateActivityRecordDto) {
    return `This action updates a #${id} activityRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityRecord`;
  }
}
