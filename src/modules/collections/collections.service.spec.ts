import 'reflect-metadata';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AvatarStyle, Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CollectionsService } from './collections.service';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

const instant = new Date('2026-10-13T12:00:00Z');

function receipt(
  id: string,
  activityKey: string,
  topic: string | null,
  finishedAt: Date | null = instant,
) {
  return {
    createdAt: instant,
    attempt: {
      id,
      activityKey,
      finishedAt,
      simulation: { disciplineId: 'matematica', topic },
    },
  };
}

function setup() {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 'student' }]),
    user: { findFirst: jest.fn().mockResolvedValue({ id: 'student' }) },
    userAchievement: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    userAvatarItem: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    userAvatar: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({}),
    },
    quizCompletionReward: { findMany: jest.fn().mockResolvedValue([]) },
    missionProgress: { count: jest.fn().mockResolvedValue(0) },
    xpEvent: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const service = new CollectionsService(prisma as unknown as PrismaService);
  return {
    tx,
    prisma,
    service,
    database: tx as unknown as Prisma.TransactionClient,
  };
}

describe('Avatar strict payloads', () => {
  it.each([
    { itemId: null },
    { style: null },
    { itemId: 'unknown' },
    { style: 'unknown' },
    { itemId: 3 },
    { style: true },
    { owned: true },
    { userId: 'other-user' },
  ])('rejects %p without coercion', (payload) => {
    const dto = plainToInstance(UpdateAvatarDto, payload);
    expect(
      validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).length,
    ).toBeGreaterThan(0);
  });

  it.each([
    { itemId: 'inicio' },
    { style: 'AUTO' },
    { itemId: 'horizonte', style: 'SEAL' },
  ])('accepts known fields %p', (payload) => {
    const dto = plainToInstance(UpdateAvatarDto, payload);
    expect(
      validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }),
    ).toEqual([]);
    expect(dto).toEqual(payload);
  });
});

describe('CollectionsService account ownership', () => {
  it('returns a free default without a write or implicit earned grants', async () => {
    const { tx, service } = setup();
    const avatar = await service.avatar('student');
    expect(avatar.selection).toEqual({ itemId: 'inicio', style: 'AUTO' });
    expect(avatar.updatedAt).toBeNull();
    expect(
      avatar.items.filter((item) => item.owned).map((item) => item.id),
    ).toEqual(['inicio']);
    expect(avatar.items.every((item) => item.unlockedAt === null)).toBe(true);
    expect(tx.userAvatar.upsert).not.toHaveBeenCalled();
    expect(tx.userAvatarItem.createMany).not.toHaveBeenCalled();
  });

  it.each(['avatar', 'achievements'] as const)(
    'rechecks actual active student on %s',
    async (operation) => {
      const { tx, service } = setup();
      tx.user.findFirst.mockResolvedValue(null);
      await expect(service[operation]('student')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(tx.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'student',
          role: 'STUDENT',
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true },
      });
    },
  );

  it('caps displayed progress at target and keeps durable earned milestones visible', async () => {
    const { tx, service } = setup();
    tx.userAchievement.findMany.mockResolvedValue([
      { achievementId: 'FIVE_QUIZZES', earnedAt: instant },
    ]);
    tx.xpEvent.aggregate.mockResolvedValue({ _sum: { amount: 150 } });
    const result = await service.achievements('student');
    expect(result.stats).toEqual({
      completedQuizzes: 0,
      topics: 0,
      completedMissions: 0,
      totalXp: 150,
    });
    expect(
      result.achievements.find(
        (achievement) => achievement.id === 'FIVE_QUIZZES',
      ),
    ).toMatchObject({ progress: 5, earnedAt: instant });
    expect(
      result.achievements.find((achievement) => achievement.id === 'XP_100'),
    ).toMatchObject({ progress: 100, earnedAt: null });
    expect(tx.userAchievement.createMany).not.toHaveBeenCalled();
  });

  it('returns only aggregate progress and generic catalogs, without private source metadata', async () => {
    const { tx, service } = setup();
    tx.quizCompletionReward.findMany.mockResolvedValue([
      receipt('private-attempt', 'private-key', 'Private topic'),
    ]);
    const result = await service.achievements('student');
    expect(result.stats).toMatchObject({ completedQuizzes: 1, topics: 1 });
    expect(JSON.stringify(result)).not.toMatch(
      /private-attempt|private-key|Private topic|disciplineId|sourceAttemptId/,
    );
  });

  it('records the current in-flight first completion and preserves exact finish timestamp', async () => {
    const { tx, service, database } = setup();
    tx.quizCompletionReward.findMany.mockResolvedValue([
      receipt('current', 'key-a', 'Números', null),
    ]);
    await service.recordCompletion(database, 'student', 'current', instant);
    expect(tx.userAchievement.createMany).toHaveBeenCalledWith({
      data: [
        {
          userId: 'student',
          achievementId: 'FIRST_QUIZ',
          earnedAt: instant,
          sourceAttemptId: 'current',
        },
      ],
      skipDuplicates: true,
    });
    expect(tx.userAvatarItem.createMany).toHaveBeenCalledWith({
      data: [
        {
          userId: 'student',
          itemId: 'primeiro-passo',
          unlockedAt: instant,
          sourceAttemptId: 'current',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('unlocks all achieved criteria without spending XP or creating starter grants', async () => {
    const { tx, service, database } = setup();
    tx.quizCompletionReward.findMany.mockResolvedValue(
      Array.from({ length: 5 }, (_, index) =>
        receipt(`attempt-${index}`, `key-${index}`, `Tema ${index % 3}`),
      ),
    );
    tx.missionProgress.count.mockResolvedValue(1);
    tx.xpEvent.aggregate.mockResolvedValue({ _sum: { amount: 100 } });
    await service.recordCompletion(database, 'student', 'attempt-4', instant);
    expect(
      tx.userAchievement.createMany.mock.calls[0][0].data.map(
        (row: { achievementId: string }) => row.achievementId,
      ),
    ).toEqual([
      'FIRST_QUIZ',
      'THREE_TOPICS',
      'FIVE_QUIZZES',
      'FIRST_MISSION',
      'XP_100',
    ]);
    expect(
      tx.userAvatarItem.createMany.mock.calls[0][0].data.map(
        (row: { itemId: string }) => row.itemId,
      ),
    ).toEqual([
      'primeiro-passo',
      'explorador',
      'constancia',
      'missao',
      'horizonte',
    ]);
  });

  it('uses the same user mutex for selection writes and never accepts ownership from the caller', async () => {
    const { tx, service } = setup();
    await service.updateAvatar('student', {
      itemId: 'inicio',
      style: AvatarStyle.SEAL,
    });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.userAvatar.upsert).toHaveBeenCalledWith({
      where: { userId: 'student' },
      create: { userId: 'student', itemId: 'inicio', style: 'SEAL' },
      update: { itemId: 'inicio', style: 'SEAL' },
    });
    expect(tx.userAvatarItem.findUnique).not.toHaveBeenCalled();
  });

  it('merges a style-only patch with the latest persisted owned item', async () => {
    const { tx, service } = setup();
    tx.userAvatar.findUnique.mockResolvedValue({
      userId: 'student',
      itemId: 'explorador',
      style: 'AUTO',
      updatedAt: instant,
    });
    tx.userAvatarItem.findUnique.mockResolvedValue({
      userId: 'student',
      itemId: 'explorador',
      unlockedAt: instant,
    });
    await service.updateAvatar('student', { style: AvatarStyle.MASCOT });
    expect(tx.userAvatar.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { itemId: 'explorador', style: 'MASCOT' },
      }),
    );
    expect(tx.userAvatarItem.findUnique).toHaveBeenCalledWith({
      where: { userId_itemId: { userId: 'student', itemId: 'explorador' } },
    });
  });

  it('rejects locked items without writing any avatar state', async () => {
    const { tx, service } = setup();
    await expect(
      service.updateAvatar('student', { itemId: 'horizonte' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.userAvatar.upsert).not.toHaveBeenCalled();
  });

  it('rejects updates when the account becomes inactive or changes role', async () => {
    const { tx, service } = setup();
    tx.$queryRaw.mockResolvedValue([]);
    await expect(
      service.updateAvatar('student', { style: AvatarStyle.SEAL }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tx.userAvatar.upsert).not.toHaveBeenCalled();
  });

  it.each([
    {},
    { itemId: undefined, style: undefined },
    { itemId: null },
    { style: null },
    { userId: 'other' },
    { itemId: 'fake' },
  ])('rejects empty or invalid service payload %p', async (payload) => {
    const { prisma, service } = setup();
    await expect(
      service.updateAvatar('student', payload as UpdateAvatarDto),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
