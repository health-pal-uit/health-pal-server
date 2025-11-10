import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents } from './types/events';
import { UseGuards } from '@nestjs/common';
import { SupabaseWsGuard } from './guards/supabase-ws.guard';
import { WsUser } from './decorators/ws-user.decorator';
import { User } from 'src/users/entities/user.entity';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
  credentials: true,
}) // temporary allow all origins
@UseGuards(SupabaseWsGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server<any, ServerToClientEvents>;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    console.log('Message received from client', client.id, ':', payload);
    // Echo the message back to the client
    client.emit('message', 'TEST MESSAGE FROM SERVER');
  }

  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @WsUser() user: User,
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: any,
  ) {
    console.log('[joinSession] Raw data received:', JSON.stringify(rawData));
    console.log('[joinSession] Data type:', typeof rawData);

    // parse if it's a string
    let data: { sessionId: string; content: string };
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
        console.log('[joinSession] Parsed data:', data);
      } catch (e) {
        console.error('[joinSession] Failed to parse data:', e);
        client.emit('error', { message: 'Invalid data format' });
        return;
      }
    } else {
      data = rawData;
    }

    const userId = user.id;
    const sessionId = data?.sessionId;
    const content = data?.content;

    if (!sessionId) {
      console.error('[joinSession] sessionId is missing!');
      client.emit('error', { message: 'sessionId is required' });
      return;
    }

    const ok = await this.chatService.isUserInSession(userId, sessionId);
    if (!ok) {
      console.log('User', userId, 'is not a participant of session', sessionId);
      client.emit('error', { message: 'You are not a participant of this session' });
      return;
    }

    console.log('User joining session:', userId, 'Session:', sessionId);
    await client.join(sessionId);

    // load and send chat history
    const messages = await this.chatService.getSessionMessages(sessionId);
    client.emit('chatHistory', { sessionId, messages });

    console.log('[joinSession] Sent chat history with', messages.length, 'messages');

    client.emit('joinedSession', { message: `Joined session ${sessionId} successfully.` });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @WsUser() user: User,
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: string | { sessionId: string; content: string },
  ) {
    // parse if it's a string
    let data: { sessionId: string; content: string };
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('[sendMessage] Failed to parse data:', e);
        client.emit('error', { message: 'Invalid data format' });
        return;
      }
    } else {
      data = rawData;
    }

    const userId = user.id;
    const { sessionId, content } = data;

    console.log('[sendMessage] sessionId:', sessionId, 'content:', content);

    if (!sessionId || !content) {
      client.emit('error', { message: 'sessionId and content are required' });
      return;
    }

    const ok = await this.chatService.isUserInSession(userId, sessionId);
    if (!ok) {
      console.log('User', userId, 'is not a participant of session', sessionId);
      client.emit('error', { message: 'You are not a participant of this session' });
      return;
    }

    // save the message and get the complete ChatMessage object
    const savedMessage = await this.chatService.saveMessage(userId, sessionId, content);

    this.server.in(sessionId).emit('newMessage', savedMessage!);
  }
}
