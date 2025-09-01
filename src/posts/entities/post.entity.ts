import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum AttachTypes {
    NONE = 'none',
    IN_APP = 'in_app'
}

@ApiSchema({name: Post.name, description: 'Post entity'})
@Entity('posts')
export class Post {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 'Post content', description: 'Content of the post'})
    @Column({type: 'text'})
    content: string;

    @ApiProperty({example: AttachTypes.NONE, description: 'Type of the attachment'})
    @Column({type: 'enum', enum: AttachTypes})
    attach_type?: AttachTypes | null;

    @ApiProperty({example: false, description: 'Indicates if the post is approved'})
    @Column({type: 'boolean', default: false})
    is_approved?: boolean | null;

    @ApiProperty({example: '2023-01-01T00:00:00Z', description: 'Creation date of the post'})
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
