import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LikesService {
  constructor(@InjectRepository(Like) private likesRepository: Repository<Like>) {}

  async create(post: Post, user: User): Promise<Like> {
    const like = this.likesRepository.create();
    like.post = post;
    like.user = user;
    return await this.likesRepository.save(like);
  }

  findAll() {
    return `This action returns all likes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} like`;
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  async remove(postId: string, userId: string): Promise<DeleteResult> {
    return this.likesRepository
      .createQueryBuilder()
      .delete()
      .from(Like)
      .where('post_id = :postId AND user_id = :userId', { postId, userId })
      .execute();
  }

  async count(postId: string, userId: string): Promise<number> {
    return await this.likesRepository.count({
      where: { post: { id: postId }, user: { id: userId } },
    });
  }
}
