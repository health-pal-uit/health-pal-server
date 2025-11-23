import { Module } from '@nestjs/common';
import { PostsMediasService } from './posts_medias.service';
import { PostsMediasController } from './posts_medias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsMedia } from './entities/posts_media.entity';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';
import { Post } from 'src/posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsMedia, Post]), SupabaseStorageModule],
  controllers: [PostsMediasController],
  providers: [PostsMediasService],
})
export class PostsMediasModule {}
