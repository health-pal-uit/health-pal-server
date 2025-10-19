import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostsMediasService } from './posts_medias.service';
import { CreatePostsMediaDto } from './dto/create-posts_media.dto';
import { UpdatePostsMediaDto } from './dto/update-posts_media.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@Controller('posts-medias')
@UseGuards(SupabaseGuard)
export class PostsMediasController {
  constructor(private readonly postsMediasService: PostsMediasService) {}

  @Post()
  create(@Body() createPostsMediaDto: CreatePostsMediaDto) {
    return this.postsMediasService.create(createPostsMediaDto);
  }

  @Get()
  findAll() {
    return this.postsMediasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsMediasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostsMediaDto: UpdatePostsMediaDto) {
    return this.postsMediasService.update(id, updatePostsMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsMediasService.remove(id);
  }
}
