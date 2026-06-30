import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<{
      handshake: { headers: Record<string, string>; auth?: { token?: string } };
      user?: { sub: number; openid: string; role: string };
    }>();

    // Extract token from handshake auth or headers
    const token =
      client.handshake.auth?.token ||
      this.extractBearer(client.handshake.headers.authorization);

    if (!token) {
      throw new WsException('Authentication required');
    }

    try {
      client.user = this.jwtService.verify<JwtPayload>(token);
      return true;
    } catch {
      throw new WsException('Invalid or expired token');
    }
  }

  private extractBearer(auth?: string): string | undefined {
    if (!auth) return undefined;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
