import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(SupabaseGuard)
  @Get('has-user-liked/:id')
  hasUserLiked(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.hasUserLiked(id, user.id);
  }

  @Get('report-amount/:id')
  @UseGuards(AdminSupabaseGuard)
  getReportAmount(@Param('id') id: string) {
    return this.postsService.getReportAmount(id);
  }

  @Get('report/:id')
  @UseGuards(SupabaseGuard)
  report(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.report(id, user.id);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
    return this.postsService.create(createPostDto, user.id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @CurrentUser() user: any) {
    return this.postsService.update(id, updatePostDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return this.postsService.adminRemove(id);
    }
    return this.postsService.remove(id, user.id);
  }

  // comments
  @Post(':id/comments')
  @UseGuards(SupabaseGuard)
  addComment(
    @Param('id') id: string,
    @Body() commentDto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.addComment(id, commentDto, user.id);
  }

  // @Get(':id/comments/:commentId')
  // @UseGuards(SupabaseGuard)
  // getComment(@Param('id') id: string, @Param('commentId') commentId: string) {
  //   return this.postsService.getOneComment(id, commentId);
  // }

  @Get(':id/comments')
  @UseGuards(SupabaseGuard)
  getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @Patch(':postId/comments/:commentId')
  @UseGuards(SupabaseGuard)
  updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() commentDto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.updateComment(postId, commentId, commentDto, user.id);
  }

  @Delete(':postId/comments/:commentId')
  @UseGuards(SupabaseGuard)
  removeComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.postsService.removeComment(postId, commentId, user.id);
  }

  // likes

  @Post(':id/like/count')
  @UseGuards(SupabaseGuard)
  getLikePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.getLikePost(id, user.id);
  }

  @Post(':id/like')
  @UseGuards(SupabaseGuard)
  likePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.likePost(id, user.id);
  }

  @Delete(':id/unlike')
  @UseGuards(SupabaseGuard)
  unlikePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.unlikePost(id, user.id);
  }
}
