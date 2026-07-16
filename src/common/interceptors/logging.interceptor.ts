import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestWithRequestId } from '../middleware/request-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithRequestId>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            event: 'http_request',
            requestId: request.requestId,
            method: request.method,
            path: request.originalUrl,
            durationMs: Date.now() - startedAt,
          }),
        );
      }),
    );
  }
}
