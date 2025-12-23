import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { PostsMedia } from 'src/posts_medias/entities/posts_media.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { AttachType } from 'src/helpers/enums/attach-type.enum';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@ApiSchema({ name: Post.name, description: 'Post entity' })
@Index('idx_posts_created_at', ['created_at'])
@Index('idx_posts_user', ['user'])
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: AttachType, default: AttachType.NONE, nullable: true })
  attach_type?: AttachType;

  @Column({ type: 'boolean', default: false })
  is_approved?: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  // relations => 3 but expands to 6
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => User, (user) => user.reported_posts)
  @JoinTable({
    name: 'posts_reported_by',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'post_id', referencedColumnName: 'id' },
  })
  reported_by: User[];

  @OneToMany(() => PostsMedia, (m) => m.post, {
    cascade: ['insert', 'update'],
    orphanedRowAction: 'delete', // or 'soft-delete' / 'nullify'
  })
  medias: PostsMedia[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  // attach -> nullable

  @ManyToOne(() => Challenge, (challenge) => challenge.posts, { nullable: true })
  attach_challenge: Challenge | null;

  @ManyToOne(() => Medal, (medal) => medal.posts, { nullable: true })
  attach_medal: Medal | null;

  @ManyToOne(() => Meal, (meal) => meal.posts, { nullable: true })
  attach_meal: Meal | null;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.posts, { nullable: true })
  attach_ingredient: Ingredient | null;

  // Virtual property for like count
  like_count?: number;
}
