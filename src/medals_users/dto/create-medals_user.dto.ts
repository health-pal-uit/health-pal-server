import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateMedalsUserDto {
  @ApiProperty({ example: new Date(), description: 'Date when the medal was achieved' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  achieved_at?: Date;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({ example: 'uuid', description: 'Medal ID that was achieved' })
  medal_id!: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({ example: 'uuid', description: 'User ID who achieved the medal' })
  user_id!: string;
}
