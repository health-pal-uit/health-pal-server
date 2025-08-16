import { Module } from '@nestjs/common';
import { PostsMediasService } from './posts_medias.service';
import { PostsMediasController } from './posts_medias.controller';

@Module({
  controllers: [PostsMediasController],
  providers: [PostsMediasService],
})
export class PostsMediasModule {}
