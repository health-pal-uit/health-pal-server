import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private commentsRepository: Repository<Comment>) {}

  async create(post: Post, createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const comment = this.commentsRepository.create({ ...createCommentDto });
    comment.post = post;
    comment.user = user;
    return await this.commentsRepository.save(comment);
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(commentId: string, updateCommentDto: UpdateCommentDto): Promise<UpdateResult> {
    const comment = await this.commentsRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new Error('Comment not found');
    }
    return this.commentsRepository.update(commentId, updateCommentDto);
  }

  async remove(postId: string, commentId: string, userId: string): Promise<UpdateResult> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'post'],
    });
    if (!comment) throw new Error('Comment not found');
    if (comment.post?.id !== postId) throw new Error('Comment does not belong to this post');
    if (comment.user?.id !== userId) throw new Error('You are not the owner of this comment');
    return this.commentsRepository.softDelete(commentId);
  }
}
