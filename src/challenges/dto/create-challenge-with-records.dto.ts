import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { ChallengeDifficulty } from 'src/helpers/enums/challenge-difficulty.enum';
import { CreateActivityRecordDto } from 'src/activity_records/dto/create-activity_record.dto';

export class CreateChallengeWithRecordsDto {
  @ApiProperty({ example: 'New Challenge', description: 'Name of the challenge' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'This is a note', description: 'Additional notes about the challenge' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'https://example.com/image.png', description: 'Image URL' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: 'easy', description: 'Difficulty level', enum: ChallengeDifficulty })
  @IsEnum(ChallengeDifficulty)
  @IsNotEmpty()
  difficulty: ChallengeDifficulty;

  @ApiProperty({
    description: 'Activity records to create for this challenge',
    type: [CreateActivityRecordDto],
    example: [
      {
        duration_minutes: 30,
        intensity_level: 3,
        activity_id: 'uuid-activity',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityRecordDto)
  activity_records: CreateActivityRecordDto[];
}
