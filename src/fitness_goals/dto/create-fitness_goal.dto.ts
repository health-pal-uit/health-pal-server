import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { FitnessGoalType } from 'src/helpers/enums/fitness-goal-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateFitnessGoalDto {
  @ApiProperty({ description: 'UUID of the fitness goal' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  target_kcal?: number;

  @ApiProperty({ description: 'Target protein intake in grams' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  target_protein_gr?: number;

  @ApiProperty({ description: 'Target fat intake in grams' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  target_fat_gr?: number;

  @ApiProperty({ description: 'Target carbs intake in grams' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  target_carbs_gr?: number;

  @ApiProperty({ description: 'Target fiber intake in grams' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  target_fiber_gr?: number;

  @ApiProperty({ description: 'Type of fitness goal', enum: FitnessGoalType })
  @IsEnum(FitnessGoalType)
  @IsNotEmpty()
  goal_type!: FitnessGoalType;

  @ApiProperty({ description: 'Amount of water drank in liters' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  water_drank_l?: number;

  @ApiProperty({ description: 'Creation date of the fitness goal' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  // relations => 1
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'ID of the user who owns this fitness goal',
  })
  @IsUUID('4')
  user_id!: string;
}
