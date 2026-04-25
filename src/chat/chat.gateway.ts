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
import { VideoCallsService } from 'src/video_calls/video_calls.service';
import { VideoCallStatus } from 'src/video_calls/entities/video_call.entity';
import { ConsultationsService } from 'src/consultations/consultations.service';

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

  constructor(
    private chatService: ChatService,
    private videoCallsService: VideoCallsService,
    private consultationsService: ConsultationsService,
  ) {}

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

  // webrtc signaling events
  @SubscribeMessage('join-video-call')
  async handleJoinVideoCall(
    @WsUser() user: User,
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: string | { consultationId: string },
  ) {
    // parse if it's a string
    let data: { consultationId: string };
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('[join-video-call] Failed to parse data:', e);
        client.emit('error', { message: 'Invalid data format' });
        return;
      }
    } else {
      data = rawData;
    }

    const userId = user.id;
    const { consultationId } = data;

    console.log('[join-video-call] User', userId, 'joining consultation', consultationId);

    if (!consultationId) {
      client.emit('error', { message: 'consultationId is required' });
      return;
    }

    // check if video call already exists for this consultation
    let videoCall = await this.videoCallsService.findByConsultation(consultationId);
    console.log('[join-video-call] Existing video call found?:', !!videoCall);
    if (videoCall) {
      console.log('[join-video-call] Found existing video call:', videoCall.id);
    }

    if (!videoCall) {
      console.log('[join-video-call] No existing video call, creating new one...');

      // fetch consultation to get patient and expert IDs (try with admin role to bypass permission check)
      let consultation;
      try {
        consultation = await this.consultationsService.findOne(consultationId, userId, 'admin');
      } catch (error) {
        console.error('[join-video-call] Failed to fetch consultation:', error.message);
        client.emit('error', { message: `Consultation not found: ${error.message}` });
        return;
      }

      if (!consultation) {
        console.error('[join-video-call] Consultation not found:', consultationId);
        client.emit('error', { message: 'Consultation not found' });
        return;
      }

      // get patient_id and expert_id from booking
      const patientId = consultation.booking?.client?.id;
      const expertId = consultation.expert?.id;

      console.log('[join-video-call] Extracted IDs:');
      console.log('[join-video-call]   Current User ID:', userId);
      console.log('[join-video-call]   Patient ID:', patientId);
      console.log('[join-video-call]   Expert ID:', expertId);
      console.log('[join-video-call]   Expert has user?:', !!consultation.expert?.user);
      console.log('[join-video-call]   Expert.user.id:', consultation.expert?.user?.id);

      if (!patientId || !expertId) {
        console.error('[join-video-call] Missing patient or expert ID in consultation');
        console.error('[join-video-call] Consultation structure:', {
          hasBooking: !!consultation.booking,
          hasClient: !!consultation.booking?.client,
          hasExpert: !!consultation.expert,
          patientId,
          expertId,
        });
        client.emit('error', { message: 'Invalid consultation data - missing patient or expert' });
        return;
      }

      // expert might be identified by expert.user.id instead of expert.id
      const expertUserId = consultation.expert?.user?.id;

      // verify user is either patient or expert
      if (userId !== patientId && userId !== expertId && userId !== expertUserId) {
        console.error('[join-video-call] User is not part of this consultation');
        console.error('[join-video-call] Comparison failed:');
        console.error('[join-video-call]   userId:', userId);
        console.error('[join-video-call]   patientId:', patientId);
        console.error('[join-video-call]   expertId:', expertId);
        console.error('[join-video-call]   expertUserId:', expertUserId);
        client.emit('error', { message: 'You are not part of this consultation' });
        return;
      }

      // create new video call record with explicit consultation object
      console.log('[join-video-call] Creating new video call for consultation', consultationId);
      console.log('[join-video-call] Patient:', patientId, 'Expert:', expertId);

      // create video call with consultation object to ensure proper relation
      videoCall = await this.videoCallsService.create({
        consultation_id: consultationId,
        patient_id: patientId,
        expert_id: expertId,
      });
      console.log('[join-video-call] Created video call with ID:', videoCall.id);

      // verify it was saved with consultation link
      const verifyCall = await this.videoCallsService.findOne(videoCall.id);
      console.log(
        '[join-video-call] Verification - has consultation?:',
        !!verifyCall?.consultation,
      );
      if (verifyCall?.consultation) {
        console.log('[join-video-call] Consultation ID in saved call:', verifyCall.consultation.id);
      }
    }

    // join the video call room
    const roomId = `video-call-${videoCall.id}`;

    // get existing peers in room before joining
    const existingPeers = await this.server.in(roomId).fetchSockets();
    console.log('[join-video-call] Existing peers in room:', existingPeers.length);

    await client.join(roomId);

    console.log('[join-video-call] User joined room:', roomId);

    // send call info to user
    client.emit('call-room-joined', { callId: videoCall.id, roomId });

    // only notify existing peers about new user (they will initiate the offer)
    // the new user just waits to receive an offer
    if (existingPeers.length > 0) {
      console.log('[join-video-call] Notifying existing peers about new user:', userId);
      client.to(roomId).emit('peer-joined', { peerId: userId });
    } else {
      console.log('[join-video-call] No existing peers, user is first in room');
    }

    // update status to connecting if waiting
    if (videoCall.status === VideoCallStatus.WAITING) {
      await this.videoCallsService.updateStatus(videoCall.id, VideoCallStatus.CONNECTING);
    }
  }

  @SubscribeMessage('webrtc-offer')
  async handleWebRTCOffer(
    @WsUser() user: User,
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: string | { to: string; callId: string; offer: any },
  ) {
    // parse if it's a string
    let data: { to: string; callId: string; offer: any };
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('[webrtc-offer] Failed to parse data:', e);
        client.emit('error', { message: 'Invalid data format' });
        return;
      }
    } else {
      data = rawData;
    }

    const { to, callId, offer } = data;

    console.log('[webrtc-offer] From:', user.id, 'To:', to, 'CallId:', callId);

    if (!to || !callId || !offer) {
      client.emit('error', { message: 'to, callId, and offer are required' });
      return;
    }

    // verify user is part of the call
    const isInCall = await this.videoCallsService.isUserInCall(user.id, callId);
    if (!isInCall) {
      console.log('[webrtc-offer] User', user.id, 'is not part of call', callId);
      client.emit('error', { message: 'You are not part of this call' });
      return;
    }

    // forward offer to other peers in the room (exclude sender)
    const roomId = `video-call-${callId}`;
    client.to(roomId).emit('webrtc-offer', {
      from: user.id,
      offer,
    });

    console.log('[webrtc-offer] Forwarded offer to other peers in room:', roomId);
  }

  @SubscribeMessage('webrtc-answer')
  async handleWebRTCAnswer(
    @WsUser() user: User,
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: string | { to: string; callId: string; answer: any },
  ) {
    // parse if it's a string
    let data: { to: string; callId: string; answer: any };
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('[webrtc-answer] Failed to parse data:', e);
        client.emit('error', { message: 'Invalid data format' });
        return;
      }
    } else {
      data = rawData;
    }

    const { to, callId, answer } = data;

    console.log('[webrtc-answer] From:', user.id, 'To:', to, 'CallId:', callId);

    if (!to || !callId || !answer) {
      client.emit('error', { message: 'to, callId, and answer are required' });
      return;
    }

    // verify user is part of the call
    const isInCall = await this.videoCallsService.isUserInCall(user.id, callId);
    if (!isInCall) {
      console.log('[webrtc-answer] User', user.id, 'is not part of call', callId);
      client.emit('error', { message: 'You are not part of this call' });
      return;
    }

    // forward answer to other peers in the room (exclude sender)
    const roomId = `video-call-${callId}`;
    client.to(roomId).emit('webrtc-answer', {
      from: user.id,
      answer,
    });

    console.log('[webrtc-answer] Forwarded answer to other peers in room:', roomId);

    // update status to active when answer is sent
    await this.videoCallsService.updateStatus(callId, VideoCallStatus.ACTIVE);
  }

  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(
    @WsUser() user: User,
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: string | { to: string; callId: string; candidate: any },
  ) {
    // parse if it's a string
    let data: { to: string; callId: string; candidate: any };
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('[ice-candidate] Failed to parse data:', e);
        client.emit('error', { message: 'Invalid data format' });
        return;
      }
    } else {
      data = rawData;
    }

    const { to, callId, candidate } = data;

    console.log('[ice-candidate] From:', user.id, 'To:', to, 'CallId:', callId);

    if (!to || !callId || !candidate) {
      client.emit('error', { message: 'to, callId, and candidate are required' });
      return;
    }

    // verify user is part of the call
    const isInCall = await this.videoCallsService.isUserInCall(user.id, callId);
    if (!isInCall) {
      console.log('[ice-candidate] User', user.id, 'is not part of call', callId);
      client.emit('error', { message: 'You are not part of this call' });
      return;
    }

    // forward ice candidate to other peers in the room (exclude sender)
    const roomId = `video-call-${callId}`;
    client.to(roomId).emit('ice-candidate', {
      from: user.id,
      candidate,
    });

    console.log('[ice-candidate] Forwarded ICE candidate to other peers in room:', roomId);
  }

  @SubscribeMessage('end-video-call')
  async handleEndVideoCall(
    @WsUser() user: User,
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: string | { callId: string },
  ) {
    // parse if it's a string
    let data: { callId: string };
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('[end-video-call] Failed to parse data:', e);
        client.emit('error', { message: 'Invalid data format' });
        return;
      }
    } else {
      data = rawData;
    }

    const { callId } = data;

    console.log('[end-video-call] User', user.id, 'ending call', callId);

    if (!callId) {
      client.emit('error', { message: 'callId is required' });
      return;
    }

    // verify user is part of the call
    const isInCall = await this.videoCallsService.isUserInCall(user.id, callId);
    if (!isInCall) {
      console.log('[end-video-call] User', user.id, 'is not part of call', callId);
      client.emit('error', { message: 'You are not part of this call' });
      return;
    }

    // update call status to ended
    await this.videoCallsService.updateStatus(callId, VideoCallStatus.ENDED);

    // notify all peers in the room
    const roomId = `video-call-${callId}`;
    this.server.in(roomId).emit('call-ended', { callId });

    console.log('[end-video-call] Call ended:', callId);
  }
}
