import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ChallengeDifficulty } from 'src/helpers/enums/challenge-difficulty.enum';
import { CreateActivityRecordDto } from 'src/activity_records/dto/create-activity_record.dto';

export class UpdateChallengeWithRecordsDto {
  @ApiProperty({ example: 'Updated Challenge', description: 'Name of the challenge' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated notes', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 'https://example.com/image.png', description: 'Image URL' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    example: 'medium',
    description: 'Difficulty level',
    enum: ChallengeDifficulty,
  })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiProperty({
    description: 'Activity records to add to this challenge',
    type: [CreateActivityRecordDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityRecordDto)
  activity_records?: CreateActivityRecordDto[];
}
