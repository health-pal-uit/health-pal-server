import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageType } from 'src/helpers/enums/message-type.enum';

@ApiSchema({ name: ChatMessage.name, description: 'Chat message entity' })
@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  message_type: MessageType;

  @Column({ type: 'text', nullable: true })
  media_url?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // relations => 2
  @ManyToOne(() => ChatSession, (chat_session) => chat_session.messages)
  @JoinColumn({ name: 'chat_session_id' })
  chat_session: ChatSession;

  @ManyToOne(() => User, (user) => user.chat_messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  user: User;

  // reflects
}
