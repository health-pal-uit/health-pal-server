import {
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
    client.emit('message', payload);
  }
}
