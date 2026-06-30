import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WalkingService } from './walking.service';
import { RedisService } from '../../redis/redis.service';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';
import { calculateTotalDistance } from '../../shared/geo-utils';

interface TrailPoint { lat: number; lng: number; timestamp: string }

interface LocationData {
  matchId: number;
  lat: number;
  lng: number;
  timestamp: string;
  heading?: number;
  speed?: number;
}

const TRAIL_KEY = (matchId: number) => `gps:trail:${matchId}`;
const ACTIVE_KEY = (matchId: number) => `gps:active:${matchId}`;

@WebSocketGateway({
  namespace: '/ws/walking',
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
})
export class WalkingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WalkingGateway.name);

  constructor(
    private walkingService: WalkingService,
    private redis: RedisService,
  ) {}

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

  // ===== GPS Tracking (Redis-backed) =====

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('walking:start_tracking')
  async handleStartTracking(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number; syncInterval?: number }) {
    const { matchId } = data;
    const room = `walk:${matchId}`;
    const user = (client as unknown as { user: { sub: number } }).user;

    const match = await this.walkingService.getMatch(matchId);
    if (!match || match.helperId !== user.sub) {
      client.emit('walking:error', { matchId, code: 'UNAUTHORIZED', message: 'Not authorized to track this walk' });
      return;
    }

    client.join(room);
    await this.redis.hset(ACTIVE_KEY(matchId), 'startedAt', new Date().toISOString());
    await this.redis.hset(ACTIVE_KEY(matchId), 'helperId', String(user.sub));

    this.server.to(room).emit('walking:tracking_started', { matchId, startedAt: new Date().toISOString() });
    this.logger.log(`GPS tracking started for match ${matchId} (Redis)`);
  }

  private async getTrail(matchId: number): Promise<TrailPoint[]> {
    return this.redis.lrange<TrailPoint>(TRAIL_KEY(matchId), 0, -1);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('walking:location_update')
  async handleLocationUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: LocationData) {
    const { matchId, lat, lng, timestamp, heading, speed } = data;
    const room = `walk:${matchId}`;

    const active = await this.redis.hget(ACTIVE_KEY(matchId), 'startedAt');
    if (!active) {
      client.emit('walking:error', { matchId, code: 'NOT_TRACKING', message: 'No active tracking session' });
      return;
    }

    const point: TrailPoint = { lat, lng, timestamp };
    await this.redis.rpush(TRAIL_KEY(matchId), JSON.stringify(point));

    // Persist to DB (async, fire-and-forget)
    this.walkingService.recordLocation(matchId, lat, lng, timestamp).catch((e) => this.logger.error('Location save failed', e));

    // Calculate stats from all trail points
    const trail = await this.getTrail(matchId);
    const totalDistanceM = trail.length > 1 ? calculateTotalDistance(trail) : 0;
    const firstTs = trail[0]?.timestamp ? new Date(trail[0].timestamp).getTime() : Date.now();
    const lastTs = new Date(timestamp).getTime();
    const totalDurationS = Math.floor((lastTs - firstTs) / 1000);

    this.server.to(room).emit('walking:location_broadcast', {
      matchId, lat, lng, timestamp, heading, speed, totalDistanceM, totalDurationS,
    });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('walking:stop_tracking')
  async handleStopTracking(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: number }) {
    const { matchId } = data;
    const room = `walk:${matchId}`;

    const trail = await this.getTrail(matchId);
    if (!trail.length) {
      client.emit('walking:error', { matchId, code: 'NOT_TRACKING', message: 'No active tracking session' });
      return;
    }

    const totalDistanceM = calculateTotalDistance(trail);
    const firstTs = trail[0]?.timestamp ? new Date(trail[0].timestamp).getTime() : Date.now();
    const lastTs = trail[trail.length - 1]?.timestamp ? new Date(trail[trail.length - 1].timestamp).getTime() : Date.now();
    const totalDurationS = Math.floor((lastTs - firstTs) / 1000);

    // Persist final trail
    const trailId = await this.walkingService.finalizeTrail(matchId, trail, totalDistanceM, totalDurationS);

    // Clean Redis keys
    await this.redis.del(ACTIVE_KEY(matchId));
    await this.redis.del(TRAIL_KEY(matchId));

    this.server.to(room).emit('walking:tracking_stopped', { matchId, trailId, totalDistanceM, totalDurationS });
    this.logger.log(`GPS tracking stopped for match ${matchId}, trail ${trailId} (Redis cleaned)`);
  }

  // Send accumulated trail to a reconnecting client
  async sendTrailSync(client: Socket, matchId: number) {
    const trail = await this.getTrail(matchId);
    if (trail.length) {
      const totalDistanceM = calculateTotalDistance(trail);
      client.emit('walking:trail_sync', { matchId, coordinates: trail, totalDistanceM });
    }
  }
}
