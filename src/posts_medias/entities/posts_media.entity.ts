import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video',
    FILE = 'file',
}

@ApiSchema({name: PostsMedia.name, description: 'Media entity for posts'})
@Entity('posts_media')
export class PostsMedia {
    @ApiProperty({example: 'uuid', description: 'Unique identifier for the media'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: MediaType.IMAGE, description: 'Type of the media'})
    @Column({type: 'enum', enum: MediaType})
    media_type: MediaType;

    @ApiProperty({example: 'https://example.com/image.jpg', description: 'URL of the media'})
    @Column({type: 'text', nullable: false})
    url: string;
}



