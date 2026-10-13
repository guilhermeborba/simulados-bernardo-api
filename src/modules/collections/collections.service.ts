import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivityKind,
  AttemptStatus,
  AvatarStyle,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  ACHIEVEMENT_CATALOG,
  AVATAR_ITEM_CATALOG,
  CollectionStats,
  quizProgress,
} from './collections.catalog';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async achievements(userId: string) {
    return this.prisma.$transaction(
      async (database) => {
        await this.assertStudent(database, userId);
        const [stats, grants] = await Promise.all([
          this.readStats(database, userId),
          database.userAchievement.findMany({ where: { userId } }),
        ]);
        return {
          achievements: ACHIEVEMENT_CATALOG.map(({ stat, ...achievement }) => {
            const grant = grants.find(
              (row) => row.achievementId === achievement.id,
            );
            return {
              ...achievement,
              progress: grant
                ? achievement.target
                : Math.min(achievement.target, stats[stat]),
              earnedAt: grant?.earnedAt ?? null,
            };
          }),
          stats,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async avatar(userId: string) {
    return this.prisma.$transaction(
      async (database) => {
        await this.assertStudent(database, userId);
        return this.readAvatar(database, userId);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async updateAvatar(userId: string, dto: UpdateAvatarDto) {
    this.assertPatch(dto);
    return this.prisma.$transaction(async (database) => {
      // Serialize initial and partial writes with quiz-finish grants, while
      // preserving FK KEY SHARE compatibility with simultaneous attempt starts.
      const users = await database.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "User"
        WHERE "id" = ${userId} AND "role" = 'STUDENT' AND "status" = 'ACTIVE' AND "deletedAt" IS NULL
        FOR NO KEY UPDATE
      `;
      if (users.length !== 1)
        throw new UnauthorizedException('Active student required');
      const current = await database.userAvatar.findUnique({
        where: { userId },
      });
      const itemId = dto.itemId ?? current?.itemId ?? 'inicio';
      const style = dto.style ?? current?.style ?? AvatarStyle.AUTO;
      if (itemId !== 'inicio') {
        const grant = await database.userAvatarItem.findUnique({
          where: { userId_itemId: { userId, itemId } },
        });
        if (!grant) throw new ForbiddenException('Avatar item is not unlocked');
      }
      if (!current || current.itemId !== itemId || current.style !== style) {
        await database.userAvatar.upsert({
          where: { userId },
          create: { userId, itemId, style },
          update: { itemId, style },
        });
      }
      return this.readAvatar(database, userId);
    });
  }

  /** Same transaction and User mutex as the first quiz finish; never grants XP. */
  async recordCompletion(
    database: Prisma.TransactionClient,
    userId: string,
    attemptId: string,
    finishedAt: Date,
  ): Promise<void> {
    const stats = await this.readStats(database, userId, {
      attemptId,
      finishedAt,
    });
    const earned = ACHIEVEMENT_CATALOG.filter(
      (achievement) => stats[achievement.stat] >= achievement.target,
    );
    if (!earned.length) return;
    await database.userAchievement.createMany({
      data: earned.map((achievement) => ({
        userId,
        achievementId: achievement.id,
        earnedAt: finishedAt,
        sourceAttemptId: attemptId,
      })),
      skipDuplicates: true,
    });
    const earnedIds = new Set<string>(
      earned.map((achievement) => achievement.id),
    );
    await database.userAvatarItem.createMany({
      data: AVATAR_ITEM_CATALOG.filter(
        (item) =>
          item.achievementId !== null && earnedIds.has(item.achievementId),
      ).map((item) => ({
        userId,
        itemId: item.id,
        unlockedAt: finishedAt,
        sourceAttemptId: attemptId,
      })),
      skipDuplicates: true,
    });
  }

  private async assertStudent(
    database: Prisma.TransactionClient,
    userId: string,
  ) {
    const user = await database.user.findFirst({
      where: {
        id: userId,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!user) throw new UnauthorizedException('Active student required');
  }

  private async readAvatar(database: Prisma.TransactionClient, userId: string) {
    const [selection, grants] = await Promise.all([
      database.userAvatar.findUnique({ where: { userId } }),
      database.userAvatarItem.findMany({ where: { userId } }),
    ]);
    return {
      selection: {
        itemId: selection?.itemId ?? 'inicio',
        style: selection?.style ?? AvatarStyle.AUTO,
      },
      items: AVATAR_ITEM_CATALOG.map((item) => {
        const grant = grants.find((row) => row.itemId === item.id);
        return {
          ...item,
          owned: item.id === 'inicio' || !!grant,
          unlockedAt: grant?.unlockedAt ?? null,
        };
      }),
      updatedAt: selection?.updatedAt ?? null,
    };
  }

  private async readStats(
    database: Prisma.TransactionClient,
    userId: string,
    currentCompletion?: { attemptId: string; finishedAt: Date },
  ): Promise<CollectionStats> {
    const [receipts, completedMissions, total] = await Promise.all([
      database.quizCompletionReward.findMany({
        where: {
          attempt: {
            studentId: userId,
            activityKey: { not: null },
            simulation: { activityKind: ActivityKind.QUIZ },
            OR: [
              { status: AttemptStatus.FINISHED },
              ...(currentCompletion
                ? [{ id: currentCompletion.attemptId }]
                : []),
            ],
          },
        },
        select: {
          createdAt: true,
          attempt: {
            select: {
              id: true,
              activityKey: true,
              finishedAt: true,
              simulation: { select: { disciplineId: true, topic: true } },
            },
          },
        },
      }),
      database.missionProgress.count({
        where: { userId, completedAt: { not: null } },
      }),
      database.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    ]);
    const progress = quizProgress(
      receipts.map((receipt) => ({
        attemptId: receipt.attempt.id,
        activityKey: receipt.attempt.activityKey!,
        disciplineId: receipt.attempt.simulation.disciplineId,
        topic: receipt.attempt.simulation.topic,
        recordedAt: receipt.createdAt,
        completedAt:
          receipt.attempt.id === currentCompletion?.attemptId
            ? currentCompletion.finishedAt
            : (receipt.attempt.finishedAt ?? receipt.createdAt),
      })),
    );
    return { ...progress, completedMissions, totalXp: total._sum.amount ?? 0 };
  }

  private assertPatch(dto: UpdateAvatarDto) {
    if (
      !dto ||
      (dto.itemId === undefined && dto.style === undefined) ||
      Object.keys(dto).some((key) => key !== 'itemId' && key !== 'style') ||
      (dto.itemId !== undefined &&
        !AVATAR_ITEM_CATALOG.some((item) => item.id === dto.itemId)) ||
      (dto.style !== undefined &&
        !Object.values(AvatarStyle).includes(dto.style))
    ) {
      throw new BadRequestException('Choose a known avatar item or style');
    }
  }
}
