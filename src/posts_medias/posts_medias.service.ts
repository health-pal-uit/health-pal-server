import { Injectable } from '@nestjs/common';
import { CreatePostsMediaDto } from './dto/create-posts_media.dto';
import { UpdatePostsMediaDto } from './dto/update-posts_media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsMedia } from './entities/posts_media.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';
import { MediaType } from 'src/helpers/enums/media-type.enum';

@Injectable()
export class PostsMediasService {
  constructor(
    @InjectRepository(PostsMedia) private postsMediasRepository: Repository<PostsMedia>,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createPostsMediaDto: CreatePostsMediaDto,
    fileBuffer?: Buffer,
    fileName?: string,
  ): Promise<PostsMedia> {
    if (createPostsMediaDto.media_type == MediaType.VIDEO) {
      const postVideoBucketName =
        this.configService.get<string>('POST_VIDEO_BUCKET_NAME') || 'post-videos';
      if (fileBuffer && fileName) {
        const videoUrl = await this.supabaseStorageService.uploadVideoFromBuffer(
          fileBuffer,
          fileName,
          postVideoBucketName,
        );
        createPostsMediaDto.url = videoUrl || createPostsMediaDto.url;
      }
    } else {
      const postImgBucketName =
        this.configService.get<string>('POST_IMG_BUCKET_NAME') || 'post-imgs';
      if (fileBuffer && fileName) {
        const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
          fileBuffer,
          fileName,
          postImgBucketName,
        );
        createPostsMediaDto.url = imageUrl || createPostsMediaDto.url;
      }
    }
    const postsMedia = this.postsMediasRepository.create(createPostsMediaDto);
    return this.postsMediasRepository.save(postsMedia);
  }

  async findAll(): Promise<PostsMedia[]> {
    return this.postsMediasRepository.find();
  }

  async findOne(id: string): Promise<PostsMedia | null> {
    return this.postsMediasRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updatePostsMediaDto: UpdatePostsMediaDto,
    fileBuffer?: Buffer,
    fileName?: string,
  ): Promise<UpdateResult> {
    const media = await this.postsMediasRepository.findOne({ where: { id } });
    if (!media) {
      throw new Error('PostsMedia not found');
    }
    if (fileBuffer && fileName) {
      const postImgBucketName =
        this.configService.get<string>('POST_IMG_BUCKET_NAME') || 'post-imgs';
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        fileBuffer,
        fileName,
        postImgBucketName,
      );
      updatePostsMediaDto.url = imageUrl || updatePostsMediaDto.url;
    }
    return await this.postsMediasRepository.update(id, updatePostsMediaDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.postsMediasRepository.delete(id);
  }
}
