import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class RegisterDto {
  @ApiProperty({ example: 'newuser', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name', required: false })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiProperty({ example: true, description: 'User gender' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  gender?: boolean;

  @ApiProperty({ example: '1990-01-01', description: 'Birth date', required: false })
  @IsOptional()
  @TransformToISODate()
  @IsDateString()
  birth_date?: Date;

  @IsUrl()
  @ApiProperty({
    example: 'http://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  @IsOptional()
  avatar_url?: string;

  @ApiProperty({ example: '2023-10-05T14:48:00.000Z', description: 'Account creation date' })
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ example: 'role-uuid', description: 'Role ID' })
  @IsOptional()
  role_id?: string;
}
