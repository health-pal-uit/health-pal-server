import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChallengesMedalDto {
  @ApiProperty({ example: 'uuid', description: 'Challenge ID' })
  @IsNotEmpty()
  @IsUUID('4')
  challenge_id: string;

  @ApiProperty({ example: 'uuid', description: 'Medal ID' })
  @IsNotEmpty()
  @IsUUID('4')
  medal_id: string;
}
