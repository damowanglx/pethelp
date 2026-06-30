import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

@WebSocketGateway({
  namespace: '/ws/chat',
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
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
  }

  @SubscribeMessage('chat:leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number }) {
    client.leave(`chat:${data.matchId}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:message')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: {
    matchId: number; content: string; msgType?: string; receiverId: number;
  }) {
    const user = (client as unknown as { user: { sub: number } }).user;
    const msg = await this.chatService.saveMessage({
      matchId: data.matchId,
      senderId: user.sub,
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

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number }) {
    const user = (client as unknown as { user: { sub: number } }).user;
    client.to(`chat:${data.matchId}`).emit('chat:typing', { matchId: data.matchId, userId: user.sub });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:read')
  async handleRead(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number; messageIds: number[] }) {
    await this.chatService.markAsRead(data.messageIds);
    const user = (client as unknown as { user: { sub: number } }).user;
    this.server.to(`chat:${data.matchId}`).emit('chat:read', { matchId: data.matchId, messageIds: data.messageIds, readBy: user.sub });
  }
}
