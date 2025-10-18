import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat_messages.service';
import { ChatMessagesController } from './chat_messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat_message.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, ChatSession, User])],
  controllers: [ChatMessagesController],
  providers: [ChatMessagesService],
})
export class ChatMessagesModule {}
