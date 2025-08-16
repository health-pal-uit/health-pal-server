import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat_messages.service';
import { ChatMessagesController } from './chat_messages.controller';

@Module({
  controllers: [ChatMessagesController],
  providers: [ChatMessagesService],
})
export class ChatMessagesModule {}
