import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { CreateActivityRecordDto } from './create-activity_record.dto';

export class UpdateManyActivityRecordsDto {
  @ApiProperty({
    description: 'Array of activity records to update',
    type: [CreateActivityRecordDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityRecordDto)
  activity_records: CreateActivityRecordDto[];
}
