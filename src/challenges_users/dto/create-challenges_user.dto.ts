import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateChallengesUserDto {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier of the user' })
  @IsUUID('4')
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: 'uuid', description: 'Unique identifier of the challenge' })
  @IsUUID('4')
  @IsNotEmpty()
  challenge_id: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Date when the challenge was achieved',
  })
  @IsOptional()
  @TransformToISODate()
  @IsDateString()
  achieved_at?: Date;
}
