import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateIngreMealDto {
  @ApiProperty({ description: 'Quantity of the ingredient meal in kilograms' })
  @IsNotEmpty()
  @IsNumber()
  quantity_kg!: number;

  // relations => 2
  @ApiProperty({ description: 'Ingredient ID' })
  @IsNotEmpty()
  @IsUUID('4')
  ingredient_id!: string;

  @ApiProperty({ description: 'Meal ID' })
  @IsNotEmpty()
  @IsUUID('4')
  meal_id!: string;
}
