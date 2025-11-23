import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { ChallengeDifficulty } from 'src/helpers/enums/challenge-difficulty.enum';

export class CreateChallengeDto {
  @ApiProperty({ example: 'New Challenge', description: 'Name of the challenge' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'This is a note', description: 'Additional notes about the challenge' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'https://example.com/image.png', description: 'Image URL' })
  @IsUrl()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: 'easy', description: 'Difficulty level', enum: ChallengeDifficulty })
  @IsEnum(ChallengeDifficulty)
  @IsNotEmpty()
  difficulty: ChallengeDifficulty;

  @ApiProperty({ required: false, description: 'ActivityRecords IDs' })
  @IsOptional()
  @IsUUID('4', { each: true })
  activity_records_ids?: string[];

  @ApiProperty({ required: false, description: 'ChallengesMedals IDs' })
  @IsOptional()
  @IsUUID('4', { each: true })
  challenges_medals_ids?: string[];
}
