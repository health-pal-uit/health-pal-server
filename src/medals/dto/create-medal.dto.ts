import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { MedalTier } from 'src/helpers/enums/medal-tier.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateMedalDto {
  @ApiProperty({ example: 'Gold Medal', description: 'Name of the medal' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'https://example.com/gold-medal.png',
    description: 'Image URL of the medal',
  })
  @IsUrl()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: MedalTier.GOLD, description: 'Tier of the medal', enum: MedalTier })
  @IsNotEmpty()
  @IsEnum(MedalTier)
  tier: MedalTier;

  @ApiProperty({ example: 'This is a note', description: 'Additional note about the medal' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: new Date(), description: 'Creation date of the medal' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;
}
