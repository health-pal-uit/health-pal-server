import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { PostsMedia } from 'src/posts_medias/entities/posts_media.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { AttachType } from 'src/helpers/enums/attach-type.enum';

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

  // relations => 3 but expands to 6
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => User, (user) => user.reported_posts)
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
}
