import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
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
    description: 'Date when the user joined the challenge',
    required: false,
  })
  @IsOptional()
  @TransformToISODate()
  @IsDateString()
  joined_at?: Date;

  @ApiProperty({
    example: '2023-01-15T00:00:00Z',
    description: 'Date when the challenge was completed',
    required: false,
  })
  @IsOptional()
  @TransformToISODate()
  @IsDateString()
  completed_at?: Date;

  @ApiProperty({
    example: 50.5,
    description: 'Progress percentage (0-100)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  progress_percent?: number;
}
