import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = randomUUID().slice(0, 8);
    const userId = (request as { user?: { sub: number } }).user?.sub || 'anon';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const status = (context.switchToHttp().getResponse() as { statusCode: number }).statusCode;
        this.logger.log(`[${requestId}] ${userId} ${method} ${url} ${status} ${Date.now() - now}ms`);
      }),
    );
  }
}
