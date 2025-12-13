import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Create a new comment for a post' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'The created comment', type: CreateCommentDto })
  async create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: { id: string }) {
    if (!createCommentDto.post_id) throw new Error('post_id is required');
    const post = await this.postsService.findOne(createCommentDto.post_id);
    if (!post || !post.id) throw new Error('Post not found');
    const userEntity = await this.usersService.findOne(user.id);
    if (!userEntity) throw new Error('User not found');
    return await this.commentsService.create(post, createCommentDto, userEntity);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all comments or comments for a specific post with pagination' })
  @ApiQuery({ name: 'postId', required: false, description: 'ID of the post to filter comments' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'List of comments', type: [CreateCommentDto] })
  async findAll(
    @Query('postId') postId?: string,
    @Query('post_id') post_id?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const targetPostId = postId || post_id;
    if (targetPostId) {
      return await this.commentsService.findByPost(targetPostId, page, limit);
    }
    return await this.commentsService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiParam({ name: 'id', description: 'ID of the comment' })
  @ApiResponse({ status: 200, description: 'The comment', type: CreateCommentDto })
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'ID of the comment' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'The updated comment', type: CreateCommentDto })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: { id: string },
  ) {
    return await this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'ID of the comment' })
  @ApiResponse({ status: 200, description: 'The deleted comment' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Query('postId') postId?: string,
    @Query('post_id') post_id?: string,
  ) {
    const targetPostId = postId || post_id;
    if (!targetPostId) throw new Error('postId is required');
    return await this.commentsService.remove(targetPostId, id, user.id);
  }
}
