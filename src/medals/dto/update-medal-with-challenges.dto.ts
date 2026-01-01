import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { MedalTier } from 'src/helpers/enums/medal-tier.enum';
import { CreateChallengeWithRecordsDto } from 'src/challenges/dto/create-challenge-with-records.dto';

export class UpdateMedalWithChallengesDto {
  @ApiProperty({ example: 'Gold Medal', description: 'Name of the medal' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: MedalTier.GOLD, description: 'Tier of the medal', enum: MedalTier })
  @IsOptional()
  @IsEnum(MedalTier)
  tier?: MedalTier;

  @ApiProperty({ example: 'This is a note', description: 'Additional note about the medal' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Challenges to create/add to this medal',
    type: [CreateChallengeWithRecordsDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChallengeWithRecordsDto)
  challenges?: CreateChallengeWithRecordsDto[];
}
