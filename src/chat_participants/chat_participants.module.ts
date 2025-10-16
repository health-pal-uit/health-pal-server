import { Module } from '@nestjs/common';
import { ChatParticipantsService } from './chat_participants.service';
import { ChatParticipantsController } from './chat_participants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatParticipant } from './entities/chat_participant.entity';
import { User } from 'src/users/entities/user.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatParticipant, User, ChatSession])],
  controllers: [ChatParticipantsController],
  providers: [ChatParticipantsService],
})
export class ChatParticipantsModule {}
