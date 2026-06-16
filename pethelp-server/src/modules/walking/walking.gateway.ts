import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WalkingService } from './walking.service';
import { calculateTotalDistance } from '../../shared/geo-utils';

interface LocationData {
  matchId: number;
  lat: number;
  lng: number;
  timestamp: string;
  heading?: number;
  speed?: number;
}

@WebSocketGateway({
  namespace: '/ws/walking',
  cors: { origin: '*' },
})
export class WalkingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WalkingGateway.name);
  private readonly activeTrackers = new Map<number, Array<{ lat: number; lng: number; timestamp: string }>>();

  constructor(private walkingService: WalkingService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Walking WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Walking WS disconnected: ${client.id}`);
  }

  // ===== Match events =====

  notifyNewApplication(matchId: number, requestId: number, ownerId: number, helperInfo: Record<string, unknown>) {
    this.server.to(`user:${ownerId}`).emit('match:new_application', { matchId, requestId, helperInfo });
  }

  notifyMatchAccepted(matchId: number, requestId: number, helperId: number, ownerInfo: Record<string, unknown>) {
    this.server.to(`user:${helperId}`).emit('match:accepted', { matchId, requestId, ownerInfo });
  }

  notifyMatchRejected(matchId: number, helperId: number) {
    this.server.to(`user:${helperId}`).emit('match:rejected', { matchId });
  }

  notifyMatchStarted(matchId: number, ownerId: number, helperId: number) {
    this.server.to(`user:${ownerId}`).emit('match:started', { matchId });
    this.server.to(`user:${helperId}`).emit('match:started', { matchId });
  }

  notifyMatchCompleted(matchId: number, ownerId: number, helperId: number) {
    this.server.to(`user:${ownerId}`).emit('match:completed', { matchId });
    this.server.to(`user:${helperId}`).emit('match:completed', { matchId });
  }

  // ===== GPS Tracking =====

  @SubscribeMessage('walking:start_tracking')
  async handleStartTracking(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number; syncInterval?: number }) {
    const { matchId } = data;
    const room = `walk:${matchId}`;

    // Verify this is the helper and match is in_progress
    const match = await this.walkingService.getMatch(matchId);
    if (!match || match.helperId !== (client as unknown as { user?: { sub: number } }).user?.sub) {
      client.emit('walking:error', { matchId, code: 'UNAUTHORIZED', message: 'Not authorized to track this walk' });
      return;
    }

    client.join(room);
    this.activeTrackers.set(matchId, []);

    this.server.to(room).emit('walking:tracking_started', { matchId, startedAt: new Date().toISOString() });
    this.logger.log(`GPS tracking started for match ${matchId}`);
  }

  @SubscribeMessage('walking:location_update')
  async handleLocationUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: LocationData) {
    const { matchId, lat, lng, timestamp, heading, speed } = data;
    const room = `walk:${matchId}`;

    const trail = this.activeTrackers.get(matchId);
    if (!trail) {
      client.emit('walking:error', { matchId, code: 'NOT_TRACKING', message: 'No active tracking session' });
      return;
    }

    const point = { lat, lng, timestamp };
    trail.push(point);

    // Persist to DB (async, fire-and-forget)
    this.walkingService.recordLocation(matchId, lat, lng, timestamp).catch((e) => this.logger.error('Location save failed', e));

    // Calculate stats
    const totalDistanceM = trail.length > 1 ? calculateTotalDistance(trail) : 0;
    const firstTs = trail[0]?.timestamp ? new Date(trail[0].timestamp).getTime() : Date.now();
    const lastTs = new Date(timestamp).getTime();
    const totalDurationS = Math.floor((lastTs - firstTs) / 1000);

    // Broadcast to everyone in walk room
    this.server.to(room).emit('walking:location_broadcast', {
      matchId, lat, lng, timestamp, heading, speed, totalDistanceM, totalDurationS,
    });
  }

  @SubscribeMessage('walking:stop_tracking')
  async handleStopTracking(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number }) {
    const { matchId } = data;
    const room = `walk:${matchId}`;

    const trail = this.activeTrackers.get(matchId);
    if (!trail) {
      client.emit('walking:error', { matchId, code: 'NOT_TRACKING', message: 'No active tracking session' });
      return;
    }

    const totalDistanceM = calculateTotalDistance(trail);
    const firstTs = trail[0]?.timestamp ? new Date(trail[0].timestamp).getTime() : Date.now();
    const lastTs = trail[trail.length - 1]?.timestamp ? new Date(trail[trail.length - 1].timestamp).getTime() : Date.now();
    const totalDurationS = Math.floor((lastTs - firstTs) / 1000);

    // Persist final trail
    const trailId = await this.walkingService.finalizeTrail(matchId, trail, totalDistanceM, totalDurationS);
    this.activeTrackers.delete(matchId);

    this.server.to(room).emit('walking:tracking_stopped', { matchId, trailId, totalDistanceM, totalDurationS });
    this.logger.log(`GPS tracking stopped for match ${matchId}, trail ${trailId}`);
  }

  // Send accumulated trail to a reconnecting client (sync every 60s or on reconnect)
  async sendTrailSync(client: Socket, matchId: number) {
    const trail = this.activeTrackers.get(matchId);
    if (trail) {
      const totalDistanceM = calculateTotalDistance(trail);
      client.emit('walking:trail_sync', { matchId, coordinates: trail, totalDistanceM });
    }
  }
}
