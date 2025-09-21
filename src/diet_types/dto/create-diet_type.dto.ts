import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateDietTypeDto {
  // fitness profile id can be assigned later through updates
  @ApiProperty({ description: 'Name of the diet type' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 20, description: 'Percentage of protein in the diet type' })
  @IsNotEmpty()
  @IsNumber()
  protein_percentages!: number;

  @ApiProperty({ example: 30, description: 'Percentage of fat in the diet type' })
  @IsNotEmpty()
  @IsNumber()
  fat_percentages!: number;

  @ApiProperty({ example: 40, description: 'Percentage of carbohydrates in the diet type' })
  @IsNotEmpty()
  @IsNumber()
  carbs_percentages!: number;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Creation date of the diet type',
  })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;
}
