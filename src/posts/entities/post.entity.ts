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

export enum AttachTypes {
  NONE = 'none',
  IN_APP = 'in_app',
}

@ApiSchema({ name: Post.name, description: 'Post entity' })
@Index('idx_posts_created_at', ['created_at'])
@Index('idx_posts_user', ['user'])
@Check(`
  (attach_type = 'none' AND attach_url IS NULL)
  OR (attach_type <> 'none' AND attach_url IS NOT NULL)
`)
@Entity('posts')
export class Post {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Post content', description: 'Content of the post' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: AttachTypes.NONE, description: 'Type of the attachment' })
  @Column({ type: 'enum', enum: AttachTypes, default: AttachTypes.NONE, nullable: true })
  attach_type?: AttachTypes | null;

  @ApiProperty({ example: false, description: 'Indicates if the post is approved' })
  @Column({ type: 'boolean', default: false })
  is_approved?: boolean | null;

  @ApiProperty({ example: 'https://example.com/attach.pdf', description: 'URL of the attachment' })
  @Column({ type: 'text', nullable: true })
  attach_url?: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the post' })
  @CreateDateColumn({ type: 'timestamptz' })
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
