import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ChatSessionStatus {
    CHAT = 'chat',
    CONSULT = 'consult'
}

@ApiSchema({name: ChatSession.name, description: 'Chat session entity'})
@Entity('chat_sessions')
export class ChatSession {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ enum: ChatSessionStatus })
    @Column({type: 'enum', enum: ChatSessionStatus})
    status: ChatSessionStatus;

    @ApiProperty()
    @Column({type: 'varchar', nullable: true})
    title: string;

    @ApiProperty()
    @Column({type: 'boolean', default: false})
    is_group: boolean;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}



