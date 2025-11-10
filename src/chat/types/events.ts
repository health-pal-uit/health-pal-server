import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';

export interface ServerToClientEvents {
  message: (payload: ChatMessage) => void;
  newMessage: (payload: ChatMessage) => void;
  chatHistory: (data: { sessionId: string; messages: ChatMessage[] }) => void;
  joinedSession: (data: { message: string }) => void;
  error: (data: { message: string }) => void;
}
