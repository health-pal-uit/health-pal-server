import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  async create(@Body() createLikeDto: CreateLikeDto) {
    return this.likesService.createFromDto(createLikeDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  async findAll(@Query('post_id') postId?: string) {
    return this.likesService.findAll(postId);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.likesService.removeById(id, user.id);
  }
}
