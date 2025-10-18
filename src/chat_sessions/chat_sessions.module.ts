import { Module } from '@nestjs/common';
import { ChatSessionsService } from './chat_sessions.service';
import { ChatSessionsController } from './chat_sessions.controller';
import { ChatSession } from './entities/chat_session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, User, ChatParticipant])],
  controllers: [ChatSessionsController],
  providers: [ChatSessionsService],
})
export class ChatSessionsModule {}
