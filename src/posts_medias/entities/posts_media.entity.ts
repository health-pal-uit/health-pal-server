import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Post } from 'src/posts/entities/post.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MediaType } from 'src/helpers/enums/media-type.enum';

@ApiSchema({ name: PostsMedia.name, description: 'Media entity for posts' })
@Index('idx_posts_media_post', ['post'])
@Entity('posts_media')
export class PostsMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  media_type: MediaType;

  @Column({ type: 'text', nullable: false })
  url: string;

  // relations => 1
  @ManyToOne(() => Post, (post) => post.medias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
