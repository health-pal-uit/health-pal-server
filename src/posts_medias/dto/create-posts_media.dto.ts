import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { MediaType } from 'src/helpers/enums/media-type.enum';

export class CreatePostsMediaDto {
  @ApiProperty({
    example: MediaType.IMAGE,
    description: 'Type of the media',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  @IsOptional()
  @IsEnum(MediaType)
  media_type: MediaType;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL of the media' })
  @IsNotEmpty()
  @IsUrl()
  url!: string;

  @ApiProperty({ example: 'uuid', description: 'Unique identifier for the post' })
  @IsNotEmpty()
  @IsUUID()
  post_id!: string;
}
