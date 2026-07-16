import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { RequestWithUser } from '../../common/guards/jwt-auth.guard';
import { RequestWithRequestId } from '../../common/middleware/request-id.middleware';
import { AuditService } from './audit.service';

interface AuditedRequest extends RequestWithUser, RequestWithRequestId {}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly auditedMethods = new Set(['POST', 'PATCH', 'DELETE']);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditedRequest>();

    if (!this.shouldAudit(request)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        void this.auditService.create({
          actorId: request.user?.id,
          action: this.getAction(request),
          method: request.method,
          path: request.originalUrl,
          statusCode: context.switchToHttp().getResponse().statusCode,
          requestId: request.requestId,
          ip: request.ip,
          userAgent: request.header('user-agent'),
          metadata: {
            params: request.params,
            query: request.query,
          },
        });
      }),
      catchError((error: unknown) => {
        void this.auditService.create({
          actorId: request.user?.id,
          action: `${this.getAction(request)}_failed`,
          method: request.method,
          path: request.originalUrl,
          requestId: request.requestId,
          ip: request.ip,
          userAgent: request.header('user-agent'),
          metadata: {
            params: request.params,
            query: request.query,
          },
        });

        return throwError(() => error);
      }),
    );
  }

  private shouldAudit(request: AuditedRequest): boolean {
    return Boolean(
      request.user?.role === UserRole.ADMIN &&
        this.auditedMethods.has(request.method),
    );
  }

  private getAction(request: AuditedRequest): string {
    return `${request.method.toLowerCase()} ${request.route?.path ?? request.path}`;
  }
}
