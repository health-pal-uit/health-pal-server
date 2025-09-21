import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreatePremiumPackageDto {
  @ApiProperty({ example: 'Gold Package', description: 'Name of the premium package' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 100, description: 'Expert fee for the premium package' })
  @IsOptional()
  @IsNumber()
  expert_fee?: number; // would use later after update

  @ApiProperty({ example: 200, description: 'Price of the premium package' })
  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last updated date of the premium package',
  })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  updated_at: Date;
}
