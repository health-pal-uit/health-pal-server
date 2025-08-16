import { Injectable } from '@nestjs/common';
import { CreatePostsMediaDto } from './dto/create-posts_media.dto';
import { UpdatePostsMediaDto } from './dto/update-posts_media.dto';

@Injectable()
export class PostsMediasService {
  create(createPostsMediaDto: CreatePostsMediaDto) {
    return 'This action adds a new postsMedia';
  }

  findAll() {
    return `This action returns all postsMedias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postsMedia`;
  }

  update(id: number, updatePostsMediaDto: UpdatePostsMediaDto) {
    return `This action updates a #${id} postsMedia`;
  }

  remove(id: number) {
    return `This action removes a #${id} postsMedia`;
  }
}
