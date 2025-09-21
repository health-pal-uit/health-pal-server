import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { ChallengeDifficulty } from 'src/helpers/enums/challenge-difficulty.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

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

  @ApiProperty({ example: '2023-01-01', description: 'Creation date' })
  @TransformToISODate()
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ required: false, description: 'ActivityRecords IDs' })
  @IsOptional()
  @IsUUID('4', { each: true })
  activity_records_id?: string[];

  @ApiProperty({ required: false, description: 'ChallengesMedals IDs' })
  @IsOptional()
  @IsUUID('4', { each: true })
  challenges_medals_id?: string[];

  // note: i dont think user would be necessary when creating challenge
}
