import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateChatParticipantDto {
  @ApiProperty({ description: 'is admin?', default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  is_admin?: boolean;

  @ApiProperty({ description: 'joined at', default: () => 'CURRENT_TIMESTAMP' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  joined_at?: Date;

  @ApiProperty({ description: 'chat session id' })
  @IsNotEmpty()
  @IsUUID('4')
  chat_session_id!: string;

  @ApiProperty({ description: 'user id' })
  @IsOptional()
  @IsUUID('4')
  user_id?: string;
}
