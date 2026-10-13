import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivityKind,
  AttemptStatus,
  MissionStatus,
  Prisma,
  QuizRewardReason,
  SimulationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { CollectionsService } from '../collections/collections.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { QUIZ_METADATA_SELECT } from '../quizzes/quizzes.presenter';
import {
  learningDay,
  segmentForSchoolYear,
  XP_DAILY_LIMIT,
  XP_PER_QUIZ,
} from './learning-calendar';

export interface QuizRewardReceipt {
  xpAwarded: number;
  reason: QuizRewardReason | 'LEGACY';
  day: string | null;
}

const missionInclude = {
  activities: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.MissionInclude;
type MissionWithActivities = Prisma.MissionGetPayload<{
  include: typeof missionInclude;
}>;
type QuizMetadata = Prisma.SimulationGetPayload<{
  select: typeof QUIZ_METADATA_SELECT;
}>;

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly collections: CollectionsService,
  ) {}

  async home(userId: string, requestedYear?: number) {
    return this.prisma.$transaction(
      async (database) => {
        const user = await this.assertStudent(database, userId);
        const instant = new Date();
        const day = learningDay(instant);
        const schoolYear =
          requestedYear ??
          user.learningPreferences?.schoolYear ??
          user.studentProfile?.schoolYear ??
          null;
        if (schoolYear !== null) segmentForSchoolYear(schoolYear);
        const [total, today, inProgress] = await Promise.all([
          database.xpEvent.aggregate({
            where: { userId },
            _sum: { amount: true },
          }),
          database.xpEvent.aggregate({
            where: { userId, day },
            _sum: { amount: true },
          }),
          database.attempt.findFirst({
            where: {
              studentId: userId,
              status: AttemptStatus.IN_PROGRESS,
              simulation: this.availableQuizWhere(userId, undefined, true),
            },
            orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
            select: {
              id: true,
              simulationId: true,
              activityKey: true,
              contentVersion: true,
              status: true,
              startedAt: true,
              finishedAt: true,
              score: true,
              maxScore: true,
              percentage: true,
              correctCount: true,
              wrongCount: true,
              durationSeconds: true,
              createdAt: true,
              updatedAt: true,
              simulation: { select: QUIZ_METADATA_SELECT },
            },
          }),
        ]);
        const quizzes =
          schoolYear === null
            ? []
            : await this.availableQuizzes(database, userId, schoolYear);
        const missions =
          schoolYear === null
            ? []
            : await this.readMissions(
                database,
                userId,
                schoolYear,
                instant,
                quizzes,
              );
        const missionNext = missions
          .flatMap((mission) => mission.activities)
          .find((activity) => !activity.completed);
        const suggestedQuiz =
          (missionNext
            ? quizzes.find((quiz) => quiz.id === missionNext.quizId)
            : null) ??
          quizzes[0] ??
          null;
        return {
          xp: {
            total: total._sum.amount ?? 0,
            today: today._sum.amount ?? 0,
            dailyLimit: XP_DAILY_LIMIT,
            perQuiz: XP_PER_QUIZ,
            day,
          },
          schoolYear,
          inProgress,
          missions,
          suggestedQuiz,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        maxWait: 10_000,
        timeout: 15_000,
      },
    );
  }

  async missions(userId: string, requestedYear?: number) {
    return this.prisma.$transaction(
      async (database) => {
        const user = await this.assertStudent(database, userId);
        const schoolYear =
          requestedYear ??
          user.learningPreferences?.schoolYear ??
          user.studentProfile?.schoolYear ??
          null;
        if (schoolYear === null) return [];
        segmentForSchoolYear(schoolYear);
        const quizzes = await this.availableQuizzes(
          database,
          userId,
          schoolYear,
        );
        return this.readMissions(
          database,
          userId,
          schoolYear,
          new Date(),
          quizzes,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async rewardFor(
    database: Prisma.TransactionClient,
    attemptId: string,
  ): Promise<QuizRewardReceipt> {
    const receipt = await database.quizCompletionReward.findUnique({
      where: { attemptId },
    });
    if (!receipt) return { xpAwarded: 0, reason: 'LEGACY', day: null };
    if (
      (receipt.reason === QuizRewardReason.AWARDED &&
        (!Number.isInteger(receipt.xpAwarded) || receipt.xpAwarded <= 0)) ||
      (receipt.reason !== QuizRewardReason.AWARDED &&
        receipt.xpAwarded !== 0) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(receipt.day)
    ) {
      throw new InternalServerErrorException('Quiz reward receipt is invalid');
    }
    return {
      xpAwarded: receipt.xpAwarded,
      reason: receipt.reason,
      day: receipt.day,
    };
  }

  /** Called only for the transition to FINISHED, inside the attempt transaction. */
  async recordCompletion(
    database: Prisma.TransactionClient,
    attempt: {
      id: string;
      studentId: string;
      activityKey: string | null;
      simulation: { schoolYear: number };
    },
    finishedAt: Date,
  ): Promise<QuizRewardReceipt> {
    // The parent row exists before any ledger. All quiz finishes for this learner
    // serialize here, including different logical activities and first grants.
    // NO KEY UPDATE keeps that mutex while allowing foreign-key KEY SHARE locks
    // from simultaneous attempt starts, which already hold their activity lock.
    const users = await database.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "User"
      WHERE "id" = ${attempt.studentId} AND "role" = 'STUDENT' AND "status" = 'ACTIVE' AND "deletedAt" IS NULL
      FOR NO KEY UPDATE
    `;
    if (users.length !== 1)
      throw new UnauthorizedException('Active student required');
    if (!attempt.activityKey)
      throw new InternalServerErrorException(
        'Quiz logical identity is missing',
      );
    const existingReceipt = await database.quizCompletionReward.findUnique({
      where: { attemptId: attempt.id },
    });
    if (existingReceipt) return this.rewardFor(database, attempt.id);
    const day = learningDay(finishedAt);
    const priorGrant = await database.xpEvent.findUnique({
      where: {
        userId_activityKey_day: {
          userId: attempt.studentId,
          activityKey: attempt.activityKey,
          day,
        },
      },
    });
    const total = await database.xpEvent.aggregate({
      where: { userId: attempt.studentId, day },
      _sum: { amount: true },
    });
    const reason = priorGrant
      ? QuizRewardReason.ALREADY_REWARDED
      : (total._sum.amount ?? 0) + XP_PER_QUIZ > XP_DAILY_LIMIT
        ? QuizRewardReason.DAILY_LIMIT
        : QuizRewardReason.AWARDED;
    const xpAwarded = reason === QuizRewardReason.AWARDED ? XP_PER_QUIZ : 0;
    if (xpAwarded) {
      await database.xpEvent.create({
        data: {
          userId: attempt.studentId,
          attemptId: attempt.id,
          activityKey: attempt.activityKey,
          day,
          amount: xpAwarded,
        },
      });
    }
    await database.quizCompletionReward.create({
      data: { attemptId: attempt.id, xpAwarded, reason, day },
    });
    // Grade accuracy and XP eligibility do not change mission progress.
    await this.recordMissionProgress(database, attempt, finishedAt);
    await this.collections.recordCompletion(
      database,
      attempt.studentId,
      attempt.id,
      finishedAt,
    );
    return { xpAwarded, reason, day };
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
      select: {
        learningPreferences: { select: { schoolYear: true } },
        studentProfile: { select: { schoolYear: true } },
      },
    });
    if (!user) throw new UnauthorizedException('Active student required');
    return user;
  }

  private availableQuizWhere(
    userId: string,
    schoolYear?: number,
    includeArchived = false,
  ): Prisma.SimulationWhereInput {
    return {
      activityKind: ActivityKind.QUIZ,
      deletedAt: null,
      publishedAt: { not: null },
      status: includeArchived
        ? { in: [SimulationStatus.PUBLISHED, SimulationStatus.ARCHIVED] }
        : SimulationStatus.PUBLISHED,
      discipline: { deletedAt: null, isActive: true },
      ...(schoolYear !== undefined ? { schoolYear } : {}),
      OR: [
        { turmaId: null },
        { turma: { deletedAt: null, memberships: { some: { userId } } } },
      ],
    };
  }

  private availableQuizzes(
    database: Prisma.TransactionClient,
    userId: string,
    schoolYear: number,
  ) {
    return database.simulation.findMany({
      where: this.availableQuizWhere(userId, schoolYear),
      select: QUIZ_METADATA_SELECT,
      distinct: ['activityKey'],
      orderBy: [{ activityKey: 'asc' }, { contentVersion: 'desc' }],
    });
  }

  private missionWhere(
    userId: string,
    schoolYear: number,
    instant: Date,
  ): Prisma.MissionWhereInput {
    return {
      status: MissionStatus.PUBLISHED,
      deletedAt: null,
      schoolYear,
      segment: segmentForSchoolYear(schoolYear),
      startsAt: { lte: instant },
      endsAt: { gt: instant },
      publishedAt: { lte: instant },
      OR: [
        { turmaId: null },
        { turma: { deletedAt: null, memberships: { some: { userId } } } },
      ],
    };
  }

  private availableMission(
    mission: MissionWithActivities,
    quizzes: Map<string, QuizMetadata>,
  ): boolean {
    return (
      mission.activities.length > 0 &&
      mission.activities.every((activity) => {
        const quiz = quizzes.get(activity.activityKey);
        return (
          quiz && (quiz.turmaId === null || quiz.turmaId === mission.turmaId)
        );
      })
    );
  }

  private async readMissions(
    database: Prisma.TransactionClient,
    userId: string,
    schoolYear: number,
    instant: Date,
    quizzes: QuizMetadata[],
  ) {
    const quizMap = new Map(quizzes.map((quiz) => [quiz.activityKey!, quiz]));
    const missions = await database.mission.findMany({
      where: this.missionWhere(userId, schoolYear, instant),
      include: {
        ...missionInclude,
        progresses: {
          where: { userId },
          include: {
            activities: {
              include: {
                attempt: {
                  select: {
                    studentId: true,
                    simulationId: true,
                    simulation: {
                      select: {
                        title: true,
                        activityKind: true,
                        status: true,
                        publishedAt: true,
                        deletedAt: true,
                        turmaId: true,
                        discipline: {
                          select: { isActive: true, deletedAt: true },
                        },
                        turma: {
                          select: {
                            deletedAt: true,
                            memberships: {
                              where: { userId },
                              select: { id: true },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ turmaId: 'asc' }, { slot: 'asc' }, { id: 'asc' }],
    });
    return missions
      .filter((mission) => this.availableMission(mission, quizMap))
      .map((mission) => {
        const progress = mission.progresses[0];
        const completions = new Map(
          progress?.activities.map((activity) => [
            activity.missionActivityId,
            activity,
          ]) ?? [],
        );
        const completedActivities = mission.activities.filter((activity) =>
          completions.has(activity.id),
        ).length;
        return {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          segment: mission.segment,
          schoolYear: mission.schoolYear,
          startsAt: mission.startsAt,
          endsAt: mission.endsAt,
          status:
            completedActivities === mission.activities.length
              ? ('COMPLETED' as const)
              : completedActivities
                ? ('IN_PROGRESS' as const)
                : ('AVAILABLE' as const),
          completedActivities,
          totalActivities: mission.activities.length,
          activities: mission.activities.map((activity) => {
            const quiz = quizMap.get(activity.activityKey)!;
            const completion = completions.get(activity.id);
            const origin = completion?.attempt.simulation;
            // Keep earned progress while respecting the current permissions of
            // the exact version whose result would be opened by this link.
            const canOpenResult =
              !!completion &&
              completion.attempt.studentId === userId &&
              !!origin &&
              origin.activityKind === ActivityKind.QUIZ &&
              origin.deletedAt === null &&
              origin.publishedAt !== null &&
              (origin.status === SimulationStatus.PUBLISHED ||
                origin.status === SimulationStatus.ARCHIVED) &&
              origin.discipline.isActive &&
              origin.discipline.deletedAt === null &&
              (origin.turmaId === null ||
                (!!origin.turma &&
                  origin.turma.deletedAt === null &&
                  origin.turma.memberships.length > 0));
            return {
              activityKey: activity.activityKey,
              title: canOpenResult ? origin!.title : quiz.title,
              quizId: canOpenResult
                ? completion!.attempt.simulationId
                : quiz.id,
              completed: !!completion,
              attemptId: canOpenResult ? completion!.attemptId : null,
            };
          }),
        };
      });
  }

  private async recordMissionProgress(
    database: Prisma.TransactionClient,
    attempt: {
      id: string;
      studentId: string;
      activityKey: string | null;
      simulation: { schoolYear: number };
    },
    finishedAt: Date,
  ) {
    const schoolYear = attempt.simulation.schoolYear;
    const quizzes = await this.availableQuizzes(
      database,
      attempt.studentId,
      schoolYear,
    );
    const quizMap = new Map(quizzes.map((quiz) => [quiz.activityKey!, quiz]));
    if (!quizMap.has(attempt.activityKey!)) return;
    const candidates = await database.mission.findMany({
      where: {
        ...this.missionWhere(attempt.studentId, schoolYear, finishedAt),
        activities: { some: { activityKey: attempt.activityKey! } },
      },
      select: { id: true },
      orderBy: { id: 'asc' },
    });
    for (const candidate of candidates) {
      // Archives and finalization serialize without preventing unrelated learners.
      const locked = await database.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Mission" WHERE "id" = ${candidate.id} FOR SHARE
      `;
      if (!locked.length) continue;
      const mission = await database.mission.findFirst({
        where: {
          id: candidate.id,
          ...this.missionWhere(attempt.studentId, schoolYear, finishedAt),
        },
        include: missionInclude,
      });
      if (!mission) continue;
      // Lock all versions, including drafts, so publication and archiving of
      // another step cannot invalidate a previously read catalogue at grant time.
      // Quiz version creation also locks its source row before inserting a version.
      await database.$queryRaw(Prisma.sql`
        SELECT "id" FROM "Simulation"
        WHERE "activityKind" = 'QUIZ' AND "activityKey" IN (${Prisma.join(mission.activities.map((item) => item.activityKey))})
        ORDER BY "id" FOR SHARE
      `);
      const currentQuizzes = await this.availableQuizzes(
        database,
        attempt.studentId,
        schoolYear,
      );
      const currentQuizMap = new Map(
        currentQuizzes.map((quiz) => [quiz.activityKey!, quiz]),
      );
      if (!this.availableMission(mission, currentQuizMap)) continue;
      const activity = mission.activities.find(
        (item) => item.activityKey === attempt.activityKey,
      );
      if (!activity) continue;
      const progress = await database.missionProgress.upsert({
        where: {
          userId_missionId: {
            userId: attempt.studentId,
            missionId: mission.id,
          },
        },
        create: { userId: attempt.studentId, missionId: mission.id },
        update: {},
      });
      await database.missionActivityCompletion.upsert({
        where: {
          progressId_missionActivityId: {
            progressId: progress.id,
            missionActivityId: activity.id,
          },
        },
        create: {
          progressId: progress.id,
          missionActivityId: activity.id,
          attemptId: attempt.id,
          completedAt: finishedAt,
        },
        update: {},
      });
      const count = await database.missionActivityCompletion.count({
        where: { progressId: progress.id },
      });
      if (
        count === mission.activities.length &&
        progress.completedAt === null
      ) {
        await database.missionProgress.update({
          where: { id: progress.id },
          data: { completedAt: finishedAt },
        });
      }
    }
  }
}
