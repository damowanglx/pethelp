import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsAuthGuard } from '../../websocket/ws-auth.guard';

@WebSocketGateway({
  namespace: '/ws/walking',
  cors: { origin: '*' },
})
export class WalkingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WalkingGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Walking WS client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Walking WS client disconnected: ${client.id}`);
  }

  // ===== Match events =====

  notifyNewApplication(matchId: number, requestId: number, ownerId: number, helperInfo: Record<string, unknown>) {
    this.server.emit('match:new_application', { matchId, requestId, ownerId, helperInfo });
  }

  notifyMatchAccepted(matchId: number, requestId: number, helperId: number, ownerInfo: Record<string, unknown>) {
    this.server.emit('match:accepted', { matchId, requestId, helperId, ownerInfo });
  }

  notifyMatchRejected(matchId: number, helperId: number) {
    this.server.emit('match:rejected', { matchId, helperId });
  }

  notifyMatchStarted(matchId: number) {
    this.server.emit('match:started', { matchId });
  }

  notifyMatchCompleted(matchId: number) {
    this.server.emit('match:completed', { matchId });
  }

  // ===== GPS tracking events (Phase 2 prep) =====

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('walking:start_tracking')
  handleStartTracking(@ConnectedSocket() _client: Socket, @MessageBody() _data: { matchId: number }) {
    // Phase 2 implementation
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('walking:location_update')
  handleLocationUpdate(@ConnectedSocket() _client: Socket, @MessageBody() _data: Record<string, unknown>) {
    // Phase 2 implementation
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('walking:stop_tracking')
  handleStopTracking(@ConnectedSocket() _client: Socket, @MessageBody() _data: { matchId: number }) {
    // Phase 2 implementation
  }
}
