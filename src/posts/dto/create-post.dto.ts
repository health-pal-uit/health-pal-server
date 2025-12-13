import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { AttachType } from 'src/helpers/enums/attach-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreatePostDto {
  @ApiProperty({ example: 'Post content', description: 'Content of the post' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: AttachType.NONE,
    description: 'Type of the attachment',
    enum: AttachType,
    default: AttachType.NONE,
    nullable: true,
  })
  @IsEnum(AttachType)
  @IsOptional()
  attach_type?: AttachType;

  @ApiProperty({ example: false, description: 'Indicates if the post is approved' })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the post' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  @ApiProperty({
    example: 'uuid',
    description: 'Unique identifier of the user who created the post',
  })
  @IsOptional()
  @IsUUID('4')
  user_id?: string;

  @ApiProperty({
    example: ['uuid1', 'uuid2'],
    description: 'List of user IDs who reported the post',
    isArray: true,
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  reported_by_ids?: string[];

  @ApiProperty({
    example: 'uuid',
    description: 'ID of the attached entity (challenge, medal, meal, or ingredient)',
  })
  @IsOptional()
  @IsUUID('4')
  attach_id?: string;

  // if attach_type === none => medias is optional
  @ApiProperty({
    example: ['uuid1', 'uuid2'],
    description: 'List of media IDs associated with the post',
    isArray: true,
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  @ValidateIf((dto) => dto.attach_type === AttachType.NONE)
  media_ids?: string[];

  // if attach_type <> none => medias is required and must contain at least one item
  @ValidateIf((dto) => dto.attach_type && dto.attach_type !== AttachType.NONE)
  @IsUUID('4', { each: true })
  @IsArray()
  @ArrayNotEmpty({
    message: 'medias must contain at least one item when attach_type is not "none"',
  })
  @ValidateNested({ each: true })
  @ApiProperty({
    required: true,
    example: ['uuid1', 'uuid2'],
    description: 'List of media IDs associated with the post',
    isArray: true,
  })
  medias_ids!: string[];

  @ApiProperty({
    example: ['uuid1', 'uuid2'],
    description: 'List of comment IDs associated with the post',
    isArray: true,
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  comment_ids?: string[];

  @ApiProperty({
    example: ['uuid1', 'uuid2'],
    description: 'List of like IDs associated with the post',
    isArray: true,
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  like_ids?: string[];
}
