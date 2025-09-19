import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Post } from 'src/posts/entities/post.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
}

@ApiSchema({ name: PostsMedia.name, description: 'Media entity for posts' })
@Index('idx_posts_media_post', ['post'])
@Entity('posts_media')
export class PostsMedia {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier for the media' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: MediaType.IMAGE, description: 'Type of the media' })
  @Column({ type: 'enum', enum: MediaType })
  media_type: MediaType;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL of the media' })
  @Column({ type: 'text', nullable: false })
  url: string;

  // relations => 1
  @ManyToOne(() => Post, (post) => post.medias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
