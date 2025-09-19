import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum ChatSessionStatus {
  CHAT = 'chat',
  CONSULT = 'consult',
}

@ApiSchema({ name: ChatSession.name, description: 'Chat session entity' })
//@Check(`(status = 'chat' AND consultation_id IS NULL) OR (status = 'consult' AND consultation_id IS NOT NULL)`)
@Entity('chat_sessions')
export class ChatSession {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: ChatSessionStatus })
  @Column({ type: 'enum', enum: ChatSessionStatus })
  status: ChatSessionStatus;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  is_group: boolean;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // relations

  // reflects
  @OneToMany(() => ChatParticipant, (chat_participant) => chat_participant.chat_session)
  participants: ChatParticipant[];

  @OneToMany(() => ChatMessage, (chat_message) => chat_message.chat_session, {
    onDelete: 'CASCADE',
  })
  messages: ChatMessage[];
}
