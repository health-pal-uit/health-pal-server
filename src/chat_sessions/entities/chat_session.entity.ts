import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatSessionStatus } from 'src/helpers/enums/chat-session-status.enum';

@ApiSchema({ name: ChatSession.name, description: 'Chat session entity' })
//@Check(`(status = 'chat' AND consultation_id IS NULL) OR (status = 'consult' AND consultation_id IS NOT NULL)`)
@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ChatSessionStatus, default: ChatSessionStatus.CHAT })
  status: ChatSessionStatus;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'boolean', default: false })
  is_group: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
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
