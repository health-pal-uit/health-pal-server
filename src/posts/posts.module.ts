import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { LikesModule } from 'src/likes/likes.module';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Challenge, Medal, Meal, Ingredient]),
    CommentsModule,
    LikesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
