import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
}

@ApiSchema({name: ChatMessage.name, description: 'Chat message entity'})
@Entity('chat_messages')
export class ChatMessage {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'text'})  
    content: string;

    @ApiProperty({ enum: MessageType })
    @Column({type: 'enum', enum: MessageType, default: MessageType.TEXT})
    message_type: MessageType;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    media_url?: string;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
