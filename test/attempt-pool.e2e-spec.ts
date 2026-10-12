import { randomUUID } from 'node:crypto';
import {
  ActivityKind,
  AttemptStatus,
  QuestionType,
  SimulationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { AttemptsCorrectionService } from '../src/modules/attempts/attempts-correction.service';
import { AttemptsService } from '../src/modules/attempts/attempts.service';
import { QuizAttemptsService } from '../src/modules/attempts/quiz-attempts.service';
import { TurmasService } from '../src/modules/turmas/turmas.service';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

// Validate the disposable base URL before adding this suite's pool constraint.
const databaseUrl = new URL(assertTestDatabaseUrl(process.env.TEST_DATABASE_URL));
databaseUrl.searchParams.set('connection_limit', '1');

jest.setTimeout(30_000);

describe('Private simulation start with a single PostgreSQL connection', () => {
  it('resumes one attempt across six concurrent starts without acquiring another connection', async () => {
    const client = new PrismaService({
      datasources: { db: { url: databaseUrl.toString() } },
    });
    const service = new AttemptsService(
      client,
      new AttemptsCorrectionService(),
      new TurmasService(client),
      new QuizAttemptsService(client, new AttemptsCorrectionService()),
    );
    const fixtureKey = randomUUID();
    const adminId = `pool-admin-${fixtureKey}`;
    const studentId = `pool-student-${fixtureKey}`;
    const disciplineId = `pool-discipline-${fixtureKey}`;
    const turmaId = `pool-turma-${fixtureKey}`;
    const simulationId = `pool-simulation-${fixtureKey}`;
    await client.$connect();
    try {
      await client.user.createMany({
        data: [
          { id: adminId, role: UserRole.ADMIN },
          { id: studentId, role: UserRole.STUDENT },
        ].map(({ id, role }) => ({
          id,
          role,
          name: 'Synthetic single-connection test',
          email: `${id}@example.test`,
          passwordHash: 'unused-synthetic-hash',
          status: UserStatus.ACTIVE,
        })),
      });
      await client.discipline.create({
        data: {
          id: disciplineId,
          name: 'Synthetic pool discipline',
          slug: `pool-discipline-${fixtureKey}`,
        },
      });
      await client.turma.create({
        data: {
          id: turmaId,
          name: 'Synthetic private pool turma',
          slug: `pool-turma-${fixtureKey}`,
          schoolYear: 3,
          memberships: { create: { userId: studentId } },
        },
      });
      await client.simulation.create({
        data: {
          id: simulationId,
          title: 'Synthetic private simulation',
          slug: `pool-simulation-${fixtureKey}`,
          activityKind: ActivityKind.SIMULATION,
          schoolYear: 3,
          bimester: 1,
          assessment: 'AV1',
          status: SimulationStatus.PUBLISHED,
          publishedAt: new Date(),
          disciplineId,
          turmaId,
          createdById: adminId,
          totalQuestions: 1,
          maxScore: 1,
          questions: {
            create: {
              type: QuestionType.MULTIPLE_CHOICE,
              statement: 'Questão sintética para validar o pool.',
              points: 1,
              sortOrder: 1,
              options: {
                create: [
                  { optionKey: 'A', text: 'Primeira opção', sortOrder: 1 },
                  { optionKey: 'B', text: 'Segunda opção', sortOrder: 2 },
                ],
              },
              answers: { create: { answerKey: 'correctAnswer', answerValue: 'A' } },
            },
          },
        },
      });

      const attempts = await Promise.all(
        Array.from({ length: 6 }, () =>
          service.startAttempt(simulationId, {
            id: studentId,
            role: UserRole.STUDENT,
          }),
        ),
      );
      expect(new Set(attempts.map((attempt) => attempt.id)).size).toBe(1);
      expect(
        await client.attempt.count({
          where: { simulationId, studentId, status: AttemptStatus.IN_PROGRESS },
        }),
      ).toBe(1);
      expect(
        await client.attemptQuestionSnapshot.count({
          where: { attempt: { simulationId } },
        }),
      ).toBe(0);
    } finally {
      try {
        // Only this suite's UUID-scoped synthetic fixtures can be removed.
        await client.attemptQuestionSnapshot.deleteMany({ where: { attempt: { simulationId } } });
        await client.attemptAnswer.deleteMany({ where: { attempt: { simulationId } } });
        await client.attempt.deleteMany({ where: { simulationId } });
        await client.questionAnswer.deleteMany({ where: { question: { simulationId } } });
        await client.questionOption.deleteMany({ where: { question: { simulationId } } });
        await client.question.deleteMany({ where: { simulationId } });
        await client.simulation.deleteMany({ where: { id: simulationId } });
        await client.turmaMembership.deleteMany({ where: { turmaId } });
        await client.turma.deleteMany({ where: { id: turmaId } });
        await client.discipline.deleteMany({ where: { id: disciplineId } });
        await client.user.deleteMany({ where: { id: { in: [adminId, studentId] } } });
      } finally {
        await client.$disconnect();
      }
    }
  });
});
