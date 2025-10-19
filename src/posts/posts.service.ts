import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DeleteResult, IsNull, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { LikesService } from 'src/likes/likes.service';
import { CommentsService } from 'src/comments/comments.service';
import { Like } from 'src/likes/entities/like.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';
import { Comment } from 'src/comments/entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    @InjectRepository(Medal) private medalsRepository: Repository<Medal>,
    @InjectRepository(Meal) private mealsRepository: Repository<Meal>,
    @InjectRepository(Ingredient) private ingredientsRepository: Repository<Ingredient>,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const post = this.postsRepository.create(createPostDto);
    if (createPostDto.attach_type === 'challenge') {
      const challenge = await this.challengesRepository.findOneBy({ id: createPostDto.attach_id });
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      post.attach_challenge = challenge;
      post.attach_ingredient = null;
      post.attach_meal = null;
      post.attach_medal = null;
    } else if (createPostDto.attach_type === 'medal') {
      const medal = await this.medalsRepository.findOneBy({ id: createPostDto.attach_id });
      if (!medal) {
        throw new Error('Medal not found');
      }
      post.attach_medal = medal;
      post.attach_challenge = null;
      post.attach_meal = null;
      post.attach_ingredient = null;
    } else if (createPostDto.attach_type === 'meal') {
      const meal = await this.mealsRepository.findOneBy({ id: createPostDto.attach_id });
      if (!meal) {
        throw new Error('Meal not found');
      }
      post.attach_meal = meal;
      post.attach_challenge = null;
      post.attach_medal = null;
      post.attach_ingredient = null;
    } else if (createPostDto.attach_type === 'ingredient') {
      const ingredient = await this.ingredientsRepository.findOneBy({
        id: createPostDto.attach_id,
      });
      if (!ingredient) {
        throw new Error('Ingredient not found');
      }
      post.attach_ingredient = ingredient;
      post.attach_challenge = null;
      post.attach_medal = null;
      post.attach_meal = null;
    } else {
      post.attach_challenge = null;
      post.attach_medal = null;
      post.attach_meal = null;
      post.attach_ingredient = null;
      // add post_media service later + then add medias to post later
    }
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    post.user = user;
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['user'], where: { deleted_at: IsNull() } });
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postsRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<UpdateResult> {
    const post = await this.postsRepository.findOne({ where: { id, user: { id: userId } } });
    if (!post) {
      throw new Error('Post not found');
    }
    return this.postsRepository.update(id, updatePostDto);
  }

  async remove(id: string, userId: string): Promise<UpdateResult> {
    const post = await this.postsRepository.findOne({ where: { id, user: { id: userId } } });
    if (!post) {
      throw new Error('Post not found');
    }
    return this.postsRepository.softDelete(id);
  }

  async adminRemove(id: string): Promise<UpdateResult> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new Error('Post not found');
    }
    return this.postsRepository.softDelete(id);
  }

  async report(id: string, userId: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'reported_by'],
    });
    if (!post) throw new Error('Post not found');

    if (post.user?.id === userId) throw new Error('You cannot report your own post');

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    if (post.reported_by?.some((u) => u.id === userId)) {
      throw new Error('User has already reported this post');
    }

    post.reported_by = [...(post.reported_by ?? []), user];
    return this.postsRepository.save(post);
  }

  async getReportAmount(id: string): Promise<number> {
    const post = await this.postsRepository.findOne({ where: { id }, relations: ['reported_by'] });
    if (!post) {
      throw new Error('Post not found');
    }
    return post.reported_by ? post.reported_by.length : 0;
  }

  // comments
  async addComment(id: string, commentDto: CreateCommentDto, userId: string): Promise<Comment> {
    // Implement add comment logic here
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new Error('Post not found');
    }
    return await this.commentsService.create(post, commentDto, user);
  }

  async getComments(id: string): Promise<Comment[]> {
    // Implement get comments logic here
    const post = await this.postsRepository.findOne({ where: { id: id }, relations: ['comments'] });
    if (!post) {
      throw new Error('Post not found');
    }
    const comments = post.comments.filter((c) => !c.deleted_at);
    return comments;
  }

  async updateComment(
    postId: string,
    commentId: string,
    commentDto: UpdateCommentDto,
    userId: string,
  ): Promise<UpdateResult> {
    // Implement update comment logic here
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['comments', 'comments.user'],
    });
    if (!post) {
      throw new Error('Post not found');
    }
    const comment = post.comments.filter((c) => !c.deleted_at).find((c) => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    if (comment.user.id !== userId) {
      throw new Error('User is not the owner of the comment');
    }
    return this.commentsService.update(comment.id, commentDto);
  }

  async removeComment(postId: string, commentId: string, userId: string): Promise<UpdateResult> {
    // Implement remove comment logic here

    return await this.commentsService.remove(postId, commentId, userId);
  }

  // likes

  async likePost(id: string, userId: string): Promise<Like> {
    // Implement like post logic here
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['likes', 'likes.user'],
    });
    if (!post) {
      throw new Error('Post not found');
    }
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const userLike = post.likes?.find((like) => like.user.id === userId);
    if (userLike) {
      throw new Error('User has already liked this post');
    }
    return await this.likesService.create(post, user);
  }

  async unlikePost(id: string, userId: string): Promise<DeleteResult> {
    // Implement unlike post logic here
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['likes', 'likes.user'],
    });
    if (!post) {
      throw new Error('Post not found');
    }
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const userLike = post.likes?.find((like) => like.user.id === userId);
    if (!userLike) {
      throw new Error('User has not liked this post');
    }
    return await this.likesService.remove(id, user.id);
  }

  async getLikePost(id: string, userId: string): Promise<number> {
    // Implement get like post logic here
    return await this.likesService.count(id, userId);
  }

  async hasUserLiked(id: string, userId: string): Promise<boolean> {
    return await this.likesService.count(id, userId).then((count) => count > 0);
  }
}
