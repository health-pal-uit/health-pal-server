import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'StrongPassword123!', description: 'User password (Strong)' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'reset-token-123456', description: 'Password reset token from email' })
  token: string;
}
