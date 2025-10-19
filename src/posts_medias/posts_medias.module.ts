import { Module } from '@nestjs/common';
import { PostsMediasService } from './posts_medias.service';
import { PostsMediasController } from './posts_medias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsMedia } from './entities/posts_media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsMedia])],
  controllers: [PostsMediasController],
  providers: [PostsMediasService],
})
export class PostsMediasModule {}
