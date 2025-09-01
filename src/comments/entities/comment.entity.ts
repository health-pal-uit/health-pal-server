import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: Comment.name, description: 'Comment entity'})
@Entity('comments')
export class Comment {
    @ApiProperty({example: 'uuid', description: 'Unique identifier for the comment'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 'This is a comment', description: 'Content of the comment'})
    @Column({type: 'text'})
    content: string;

    @ApiProperty({example: true, description: 'Indicates if the comment is approved'})
    @Column({type: 'boolean', default: false})
    is_approved?: boolean | null;

    @ApiProperty({example: '2023-01-01T00:00:00Z', description: 'Creation date of the comment'})
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
