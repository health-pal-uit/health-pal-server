import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { MedalTier } from 'src/helpers/enums/medal-tier.enum';
import { CreateChallengeWithRecordsDto } from 'src/challenges/dto/create-challenge-with-records.dto';

export class CreateMedalWithChallengesDto {
  @ApiProperty({ example: 'Gold Medal', description: 'Name of the medal' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: MedalTier.GOLD, description: 'Tier of the medal', enum: MedalTier })
  @IsNotEmpty()
  @IsEnum(MedalTier)
  tier: MedalTier;

  @ApiProperty({ example: 'This is a note', description: 'Additional note about the medal' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Challenges to create for this medal',
    type: [CreateChallengeWithRecordsDto],
    example: [
      {
        name: 'Run Challenge',
        difficulty: 'medium',
        activity_records: [
          {
            duration_minutes: 30,
            intensity_level: 3,
            activity_id: 'uuid-activity',
          },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChallengeWithRecordsDto)
  challenges: CreateChallengeWithRecordsDto[];
}
