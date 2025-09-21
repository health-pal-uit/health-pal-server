import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  name!: string; // @IsString() in dto

  @ApiProperty({ description: 'Creation date', example: '2023-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;
}
