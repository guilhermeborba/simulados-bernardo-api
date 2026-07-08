import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabase(): Promise<{ ok: boolean }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}
