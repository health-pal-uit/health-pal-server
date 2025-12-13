import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likesRepository: Repository<Like>,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(post: Post, user: User): Promise<Like> {
    const like = this.likesRepository.create();
    like.post = post;
    like.user = user;
    return await this.likesRepository.save(like);
  }

  async createFromDto(createLikeDto: CreateLikeDto): Promise<Like> {
    const post = await this.postsRepository.findOne({ where: { id: createLikeDto.post_id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const user = await this.usersRepository.findOne({ where: { id: createLikeDto.user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.likesRepository.findOne({
      where: { post: { id: post.id }, user: { id: user.id } },
    });
    if (existing) {
      return existing;
    }
    return this.create(post, user);
  }

  async findAll(postId?: string): Promise<Like[]> {
    if (postId) {
      return await this.likesRepository.find({
        where: { post: { id: postId } },
      });
    }
    return await this.likesRepository.find();
  }

  async findOne(id: string): Promise<Like | null> {
    return await this.likesRepository.findOne({ where: { id } });
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  async remove(postId: string, userId: string): Promise<Like | null> {
    const like = await this.likesRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });
    await this.likesRepository
      .createQueryBuilder()
      .delete()
      .from(Like)
      .where('post_id = :postId AND user_id = :userId', { postId, userId })
      .execute();
    return like;
  }

  async removeById(likeId: string, userId: string): Promise<Like | null> {
    if (!likeId || likeId === 'undefined') {
      return null;
    }
    const like = await this.likesRepository.findOne({
      where: { id: likeId },
      relations: ['user', 'post'],
    });
    if (!like) {
      return null;
    }
    if (like.user?.id !== userId) {
      throw new ForbiddenException('You are not the owner of this like');
    }
    await this.likesRepository.delete(likeId);
    return like;
  }

  async count(postId: string, userId: string): Promise<number> {
    return await this.likesRepository.count({
      where: { post: { id: postId }, user: { id: userId } },
    });
  }

  async countByPost(postId: string): Promise<number> {
    return await this.likesRepository.count({ where: { post: { id: postId } } });
  }
}
