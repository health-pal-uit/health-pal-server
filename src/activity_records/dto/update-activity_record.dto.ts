import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityRecordDto } from './create-activity_record.dto';

export class UpdateActivityRecordDto extends PartialType(CreateActivityRecordDto) {}
