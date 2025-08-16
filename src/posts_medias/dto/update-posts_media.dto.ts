import { PartialType } from '@nestjs/mapped-types';
import { CreatePostsMediaDto } from './create-posts_media.dto';

export class UpdatePostsMediaDto extends PartialType(CreatePostsMediaDto) {}
