import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFavIngreDto {
  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @IsNotEmpty()
  @IsUUID('4')
  user_id!: string;

  @ApiProperty({ example: 'uuid', description: 'Ingredient ID' })
  @IsNotEmpty()
  @IsUUID('4')
  ingredient_id!: string;
}
