import { Module } from '@nestjs/common';
import { ChatParticipantsService } from './chat_participants.service';
import { ChatParticipantsController } from './chat_participants.controller';

@Module({
  controllers: [ChatParticipantsController],
  providers: [ChatParticipantsService],
})
export class ChatParticipantsModule {}
