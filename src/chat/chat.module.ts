import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';
import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';
import { UsersModule } from 'src/users/users.module';
import { SupabaseWsGuard } from './guards/supabase-ws.guard';
import { VideoCallsModule } from 'src/video_calls/video_calls.module';
import { ConsultationsModule } from 'src/consultations/consultations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatParticipant, ChatMessage]),
    UsersModule,
    VideoCallsModule,
    ConsultationsModule,
  ],
  providers: [ChatGateway, ChatService, SupabaseWsGuard],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
