import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

interface CreateAuditLogInput {
  actorId?: string;
  action: string;
  method: string;
  path: string;
  statusCode?: number;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          action: input.action,
          method: input.method,
          path: input.path,
          statusCode: input.statusCode,
          requestId: input.requestId,
          ip: input.ip,
          userAgent: input.userAgent,
          metadata: input.metadata as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'audit_log_failed',
          requestId: input.requestId,
          action: input.action,
        }),
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
