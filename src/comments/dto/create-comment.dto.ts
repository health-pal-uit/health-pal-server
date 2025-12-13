import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment', description: 'Content of the comment' })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @ApiProperty({ example: true, description: 'Indicates if the comment is approved' })
  @IsBoolean()
  @IsOptional()
  is_approved?: boolean | null;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the comment' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  @ApiProperty({ example: 'uuid', description: 'Unique identifier for the user' })
  @IsUUID('4')
  @IsOptional()
  user_id?: string;

  @ApiProperty({ example: 'uuid', description: 'Unique identifier for the post' })
  @IsUUID('4')
  @IsNotEmpty()
  post_id?: string;
}
