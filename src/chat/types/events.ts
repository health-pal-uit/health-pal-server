import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';

export interface ServerToClientEvents {
  message: (payload: ChatMessage) => void;
  newMessage: (payload: ChatMessage) => void;
  chatHistory: (data: { sessionId: string; messages: ChatMessage[] }) => void;
  joinedSession: (data: { message: string }) => void;
  error: (data: { message: string }) => void;
  // webrtc events
  'call-room-joined': (data: { callId: string; roomId: string }) => void;
  'peer-joined': (data: { peerId: string }) => void;
  'webrtc-offer': (data: { from: string; offer: any }) => void;
  'webrtc-answer': (data: { from: string; answer: any }) => void;
  'ice-candidate': (data: { from: string; candidate: any }) => void;
  'call-ended': (data: { callId: string }) => void;
}
