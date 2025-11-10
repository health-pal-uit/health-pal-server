import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';

export interface ServerToClientEvents {
  message: (payload: ChatMessage) => void;
}
