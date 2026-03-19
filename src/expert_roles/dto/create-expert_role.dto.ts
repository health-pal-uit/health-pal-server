import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExpertRoleDto {
  @ApiProperty({ example: 'Nutrition Coach', description: 'Role name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: true,
    description: 'Whether this role supports video consultations',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  can_do_video?: boolean;

  @ApiProperty({
    example: 'Supports meal and macro consulting',
    description: 'Role description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
