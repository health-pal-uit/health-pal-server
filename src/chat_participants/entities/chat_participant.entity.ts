import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@ApiSchema({ name: ChatParticipant.name, description: 'Chat participant entity' })
@Unique('UQ_chat_participants_session_user', ['chat_session', 'user'])
@Entity('chat_participants')
export class ChatParticipant {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  is_admin: boolean;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  // relations => 2

  @ManyToOne(() => ChatSession, (chat_session) => chat_session.participants)
  @JoinColumn({ name: 'chat_session_id' })
  chat_session: ChatSession;

  @ManyToOne(() => User, (user) => user.chat_participants)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // reflects
}
