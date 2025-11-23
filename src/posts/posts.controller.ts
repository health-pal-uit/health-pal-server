import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';

@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(SupabaseGuard)
  @Get('has-user-liked/:id')
  @ApiOperation({ summary: 'Check if the current user has liked a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Boolean indicating if liked' })
  async hasUserLiked(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.postsService.hasUserLiked(id, user.id);
  }

  @Get('report-amount/:id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Get the number of reports for a post (admin only)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Report count' })
  async getReportAmount(@Param('id') id: string) {
    return await this.postsService.getReportAmount(id);
  }

  @Get('report/:id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Report a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post reported' })
  @ApiResponse({ status: 400, description: 'Cannot report own post or already reported' })
  async report(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.postsService.report(id, user.id);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created' })
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
    return await this.postsService.create(createPostDto, user.id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'List of posts' })
  async findAll() {
    return await this.postsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a specific post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post details' })
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated' })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: any,
  ) {
    return await this.postsService.update(id, updatePostDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a post (soft delete for users, hard delete for admins)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post removed' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.postsService.adminRemove(id);
    }
    return await this.postsService.remove(id, user.id);
  }

  // comments
  @Post(':id/comments')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment added' })
  async addComment(
    @Param('id') id: string,
    @Body() commentDto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return await this.postsService.addComment(id, commentDto, user.id);
  }

  // @Get(':id/comments/:commentId')
  // @UseGuards(SupabaseGuard)
  // getComment(@Param('id') id: string, @Param('commentId') commentId: string) {
  //   return this.postsService.getOneComment(id, commentId);
  // }

  @Get(':id/comments')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async getComments(@Param('id') id: string) {
    return await this.postsService.getComments(id);
  }

  @Patch(':postId/comments/:commentId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated' })
  async updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() commentDto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    return await this.postsService.updateComment(postId, commentId, commentDto, user.id);
  }

  @Delete(':postId/comments/:commentId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment removed' })
  async removeComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return await this.postsService.removeComment(postId, commentId, user.id);
  }

  // likes

  @Post(':id/like/count')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get like count for a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Like count' })
  async getLikePost(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.postsService.getLikePost(id, user.id);
  }

  @Post(':id/like')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 201, description: 'Post liked' })
  async likePost(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.postsService.likePost(id, user.id);
  }

  @Delete(':id/unlike')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post unliked' })
  async unlikePost(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.postsService.unlikePost(id, user.id);
  }
}
