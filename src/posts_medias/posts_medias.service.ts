import { Injectable } from '@nestjs/common';
import { CreatePostsMediaDto } from './dto/create-posts_media.dto';
import { UpdatePostsMediaDto } from './dto/update-posts_media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsMedia } from './entities/posts_media.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class PostsMediasService {
  constructor(
    @InjectRepository(PostsMedia) private postsMediasRepository: Repository<PostsMedia>,
  ) {}

  async create(createPostsMediaDto: CreatePostsMediaDto): Promise<PostsMedia> {
    const postsMedia = this.postsMediasRepository.create(createPostsMediaDto);
    return this.postsMediasRepository.save(postsMedia);
  }

  async findAll(): Promise<PostsMedia[]> {
    return this.postsMediasRepository.find();
  }

  async findOne(id: string): Promise<PostsMedia | null> {
    return this.postsMediasRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePostsMediaDto: UpdatePostsMediaDto): Promise<UpdateResult> {
    return await this.postsMediasRepository.update(id, updatePostsMediaDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.postsMediasRepository.delete(id);
  }
}
