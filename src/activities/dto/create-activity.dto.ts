import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ActivityType } from 'src/helpers/enums/activity-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Running', description: 'Name of the activity' })
  name: string;

  @ApiProperty({ example: 8, description: 'Metabolic equivalent of task (MET) value' })
  @IsNotEmpty()
  @IsNumber()
  met_value: number;

  @ApiProperty({ example: true, description: 'Indicates if the activity supports repetitions' })
  @IsBoolean()
  @IsNotEmpty()
  supports_rep: boolean;

  @ApiProperty({ example: true, description: 'Indicates if the activity supports hours' })
  @IsBoolean()
  @IsNotEmpty()
  supports_hour: boolean;

  @ApiProperty({
    example: [ActivityType.CARDIO],
    description: 'Categories the activity belongs to',
  })
  @IsArray()
  @IsOptional()
  @IsEnum(ActivityType, { each: true })
  categories: ActivityType[];

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the activity' })
  @IsOptional()
  @TransformToISODate()
  @IsDateString()
  created_at: Date;

  // relations => 0

  // reflects

  // activity_records: ActivityRecord[];
  @ApiProperty({ required: false, description: 'Activitys IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  activity_record_ids?: string[];
}
