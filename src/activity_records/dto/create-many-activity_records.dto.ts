import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateActivityRecordDto } from './create-activity_record.dto';

export class CreateManyActivityRecordsDto {
  @ApiProperty({
    description: 'Array of activity records to create',
    type: [CreateActivityRecordDto],
    example: [
      {
        duration_minutes: 30,
        intensity_level: 3,
        activity_id: 'uuid-1',
        challenge_id: 'uuid-challenge',
      },
      {
        duration_minutes: 60,
        intensity_level: 4,
        activity_id: 'uuid-2',
        challenge_id: 'uuid-challenge',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityRecordDto)
  activity_records: CreateActivityRecordDto[];
}
