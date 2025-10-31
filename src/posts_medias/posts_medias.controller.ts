import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostsMediasService } from './posts_medias.service';
import { CreatePostsMediaDto } from './dto/create-posts_media.dto';
import { UpdatePostsMediaDto } from './dto/update-posts_media.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts-medias')
@UseGuards(SupabaseGuard)
export class PostsMediasController {
  constructor(private readonly postsMediasService: PostsMediasService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createPostsMediaDto: CreatePostsMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileBuffer = file?.buffer;
    const fileName = file?.originalname;
    return this.postsMediasService.create(createPostsMediaDto, fileBuffer, fileName);
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
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updatePostsMediaDto: UpdatePostsMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileBuffer = file?.buffer;
    const fileName = file?.originalname;
    return this.postsMediasService.update(id, updatePostsMediaDto, fileBuffer, fileName);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsMediasService.remove(id);
  }
}
