import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ApiSchema({ name: Comment.name, description: 'Comment entity' })
@Entity('comments')
export class Comment {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier for the comment' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'This is a comment', description: 'Content of the comment' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: true, description: 'Indicates if the comment is approved' })
  @Column({ type: 'boolean', default: false })
  is_approved?: boolean | null;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the comment' })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // relations => 3
  @ManyToOne(() => User, (user) => user.comments, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  @Index('idx_comments_user')
  user: User;

  @ManyToMany(() => User, (user) => user.reported_comments)
  reported_by: User[];

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @Index('idx_comments_post')
  post: Post;

  // reflects
}
