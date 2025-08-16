import { Module } from '@nestjs/common';
import { ChatSessionsService } from './chat_sessions.service';
import { ChatSessionsController } from './chat_sessions.controller';

@Module({
  controllers: [ChatSessionsController],
  providers: [ChatSessionsService],
})
export class ChatSessionsModule {}
