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
  Query,
} from '@nestjs/common';
import { PostsMediasService } from './posts_medias.service';
import { CreatePostsMediaDto } from './dto/create-posts_media.dto';
import { UpdatePostsMediaDto } from './dto/update-posts_media.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { PostsMediaPaginationDto } from './posts-media-pagination.dto';

@ApiBearerAuth()
@Controller('posts-medias')
@UseGuards(SupabaseGuard)
export class PostsMediasController {
  constructor(private readonly postsMediasService: PostsMediasService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new media for a post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        post_id: { type: 'string' },
        media_type: { type: 'string', enum: ['image', 'video'] },
        url: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Media created' })
  @ApiResponse({ status: 400, description: 'User does not own the post' })
  async create(
    @CurrentUser() user: any,
    @Body() createPostsMediaDto: CreatePostsMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileBuffer = file?.buffer;
    const fileName = file?.originalname;
    return await this.postsMediasService.create(createPostsMediaDto, fileBuffer, fileName, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medias' })
  @ApiResponse({ status: 200, description: 'List of medias' })
  async findAll(@Query() query: PostsMediaPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.postsMediasService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific media' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({ status: 200, description: 'Media details' })
  async findOne(@Param('id') id: string) {
    return await this.postsMediasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update a media' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        media_type: { type: 'string', enum: ['image', 'video'] },
        url: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media updated' })
  @ApiResponse({ status: 400, description: 'User does not own the post' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePostsMediaDto: UpdatePostsMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileBuffer = file?.buffer;
    const fileName = file?.originalname;
    return await this.postsMediasService.update(
      id,
      updatePostsMediaDto,
      fileBuffer,
      fileName,
      user.id,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a media' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({ status: 200, description: 'Media removed' })
  @ApiResponse({ status: 400, description: 'User does not own the post' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.postsMediasService.remove(id, user.id);
  }
}
