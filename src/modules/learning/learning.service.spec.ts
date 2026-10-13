import { InternalServerErrorException } from '@nestjs/common';
import { Prisma, QuizRewardReason } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LearningService } from './learning.service';

describe('learning finish receipts', () => {
  const service = new LearningService({} as PrismaService);

  function database(receipt: unknown) {
    return {
      quizCompletionReward: {
        findUnique: jest.fn().mockResolvedValue(receipt),
      },
    } as unknown as Prisma.TransactionClient;
  }

  it('does not backfill a reward for previously finished attempts', async () => {
    await expect(
      service.rewardFor(database(null), 'old-attempt'),
    ).resolves.toEqual({ xpAwarded: 0, reason: 'LEGACY', day: null });
  });

  it('preserves the original receipt when future pilot parameters change', async () => {
    await expect(
      service.rewardFor(
        database({
          xpAwarded: 15,
          reason: QuizRewardReason.AWARDED,
          day: '2026-10-12',
        }),
        'attempt',
      ),
    ).resolves.toEqual({ xpAwarded: 15, reason: 'AWARDED', day: '2026-10-12' });
  });

  it.each([
    { xpAwarded: 0, reason: QuizRewardReason.AWARDED, day: '2026-10-12' },
    { xpAwarded: -10, reason: QuizRewardReason.AWARDED, day: '2026-10-12' },
    { xpAwarded: 1.5, reason: QuizRewardReason.AWARDED, day: '2026-10-12' },
    { xpAwarded: 10, reason: QuizRewardReason.DAILY_LIMIT, day: '2026-10-12' },
    {
      xpAwarded: 10,
      reason: QuizRewardReason.ALREADY_REWARDED,
      day: '2026-10-12',
    },
    {
      xpAwarded: 0,
      reason: QuizRewardReason.ALREADY_REWARDED,
      day: '12/10/2026',
    },
  ])('fails closed for inconsistent receipts %j', async (receipt) => {
    await expect(
      service.rewardFor(database(receipt), 'attempt'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
