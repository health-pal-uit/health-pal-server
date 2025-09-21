import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFavMealDto {
  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @IsNotEmpty()
  @IsUUID('4')
  user_id!: string;

  @ApiProperty({ example: 'uuid', description: 'Meal ID' })
  @IsNotEmpty()
  @IsUUID('4')
  meal_id!: string;
}
