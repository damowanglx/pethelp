import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/ws/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Chat WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat WS disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat:join')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number }) {
    client.join(`chat:${data.matchId}`);
    this.logger.log(`Client ${client.id} joined room chat:${data.matchId}`);
  }

  @SubscribeMessage('chat:leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number }) {
    client.leave(`chat:${data.matchId}`);
  }

  @SubscribeMessage('chat:message')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: {
    matchId: number; content: string; msgType?: string; senderId: number; receiverId: number;
  }) {
    const msg = await this.chatService.saveMessage({
      matchId: data.matchId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      msgType: data.msgType || 'text',
    });

    this.server.to(`chat:${data.matchId}`).emit('chat:message', {
      id: msg.id,
      matchId: msg.matchId,
      senderId: msg.senderId,
      content: msg.content,
      msgType: msg.msgType,
      createdAt: msg.createdAt,
    });
  }

  @SubscribeMessage('chat:typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number; userId: number }) {
    client.to(`chat:${data.matchId}`).emit('chat:typing', { matchId: data.matchId, userId: data.userId });
  }

  @SubscribeMessage('chat:read')
  async handleRead(@MessageBody() data: { matchId: number; messageIds: number[]; readerId: number }) {
    await this.chatService.markAsRead(data.messageIds);
    this.server.to(`chat:${data.matchId}`).emit('chat:read', { matchId: data.matchId, messageIds: data.messageIds, readBy: data.readerId });
  }
}
