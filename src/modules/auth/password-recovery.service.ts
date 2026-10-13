import { createHash, randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';
import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ResendMailService } from './resend-mail.service';
import { ResetPasswordDto } from './dto/password-recovery.dto';

export const RECOVERY_ACCEPTED_MESSAGE =
  'Se houver uma conta ativa para este e-mail, enviaremos as instruções de recuperação.';
const COOLDOWN_MS = 60_000;
const EXPIRY_MS = 30 * 60_000;
const RESPONSE_FLOOR_MS = 1000;
const invalidLink = () =>
  new BadRequestException(
    'Link de recuperação inválido ou expirado. Solicite um novo link.',
  );
const tokenHash = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: ResendMailService,
  ) {}

  async forgotPassword(email: string) {
    if (!this.mail.isConfigured())
      throw new ServiceUnavailableException(
        'Recuperação de senha temporariamente indisponível. Tente novamente mais tarde.',
      );
    const started = performance.now();
    try {
      const request = await this.prisma.$transaction(
        async (database) => {
          // Shared user lock orders creation, reset, login and refresh consistently.
          const users = await database.$queryRaw<
            { id: string; email: string }[]
          >`
          SELECT "id", "email" FROM "User" WHERE "email"=${email.trim().toLowerCase()} AND "status"='ACTIVE' AND "deletedAt" IS NULL FOR NO KEY UPDATE`;
          if (users.length !== 1) return null;
          const user = users[0];
          const now = new Date();
          const last = await database.passwordResetToken.findFirst({
            where: { userId: user.id },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: { createdAt: true },
          });
          if (last && now.getTime() - last.createdAt.getTime() < COOLDOWN_MS)
            return null;
          const token = randomBytes(32).toString('base64url');
          const saved = await database.passwordResetToken.create({
            data: {
              userId: user.id,
              tokenHash: tokenHash(token),
              expiresAt: new Date(now.getTime() + EXPIRY_MS),
              createdAt: now,
            },
          });
          return { id: saved.id, email: user.email, token };
        },
        { maxWait: 10_000, timeout: 15_000 },
      );
      if (request) {
        const link = new URL(
          '/redefinir-senha',
          this.config.getOrThrow<string>('FRONTEND_URL'),
        );
        link.hash = new URLSearchParams({ token: request.token }).toString();
        const delivered = await this.mail.sendRecovery(
          request.email,
          link.toString(),
          request.id,
        );
        await this.prisma.passwordResetToken.updateMany({
          where: { id: request.id, usedAt: null },
          data: delivered
            ? { deliveredAt: new Date() }
            : { usedAt: new Date() },
        });
        if (!delivered)
          this.logger.warn(
            JSON.stringify({ event: 'password_recovery_delivery_failed' }),
          );
      }
      return { message: RECOVERY_ACCEPTED_MESSAGE };
    } catch {
      // Fail uniformly even when a provider or storage dependency is unavailable.
      // A request can be retried after the cooldown; raw links never leave this service.
      this.logger.warn(
        JSON.stringify({ event: 'password_recovery_request_failed' }),
      );
      return { message: RECOVERY_ACCEPTED_MESSAGE };
    } finally {
      await delay(
        Math.max(0, RESPONSE_FLOOR_MS - (performance.now() - started)),
      );
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = tokenHash(dto.token);
    const reference = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashedToken },
      select: {
        userId: true,
        expiresAt: true,
        usedAt: true,
        deliveredAt: true,
      },
    });
    if (
      !reference ||
      reference.usedAt ||
      !reference.deliveredAt ||
      reference.expiresAt <= new Date()
    )
      throw invalidLink();
    const passwordHash = await hash(dto.password, 12);
    const saved = await this.prisma.$transaction(
      async (database) => {
        const locked = await database.$queryRaw<
          { id: string }[]
        >`SELECT "id" FROM "User" WHERE "id"=${reference.userId} FOR NO KEY UPDATE`;
        if (locked.length !== 1) throw invalidLink();
        const user = await database.user.findUnique({
          where: { id: reference.userId },
        });
        const token = await database.passwordResetToken.findUnique({
          where: { tokenHash: hashedToken },
        });
        const now = new Date();
        if (
          !user ||
          user.status !== UserStatus.ACTIVE ||
          user.deletedAt ||
          !token ||
          token.usedAt ||
          !token.deliveredAt ||
          token.expiresAt <= now
        )
          throw invalidLink();
        const consumed = await database.passwordResetToken.updateMany({
          where: {
            id: token.id,
            usedAt: null,
            deliveredAt: { not: null },
            expiresAt: { gt: now },
          },
          data: { usedAt: now },
        });
        if (consumed.count !== 1) throw invalidLink();
        await database.user.update({
          where: { id: user.id },
          data: { passwordHash, authVersion: { increment: 1 } },
        });
        await database.refreshToken.updateMany({
          where: { userId: user.id, revokedAt: null },
          data: { revokedAt: now },
        });
        await database.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: now },
        });
        return { email: user.email, tokenId: token.id };
      },
      { maxWait: 10_000, timeout: 15_000 },
    );
    // A notification failure must not undo a password that was already committed.
    if (!(await this.mail.sendPasswordChanged(saved.email, saved.tokenId)))
      this.logger.warn(
        JSON.stringify({ event: 'password_change_notification_failed' }),
      );
    return { success: true as const };
  }
}
