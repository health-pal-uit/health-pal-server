import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ActivityType } from 'src/helpers/enums/activity-type.enum';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Running', description: 'Name of the activity' })
  name: string;

  @ApiProperty({ example: 8, description: 'Metabolic equivalent of task (MET) value' })
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'MET value must be positive' })
  met_value: number;

  @ApiProperty({
    example: [ActivityType.CARDIO],
    description: 'Categories the activity belongs to',
  })
  @IsArray()
  @IsOptional()
  @IsEnum(ActivityType, { each: true })
  categories: ActivityType[];
}
