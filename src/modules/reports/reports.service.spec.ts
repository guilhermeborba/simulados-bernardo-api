import { Test } from '@nestjs/testing';
import { AttemptStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { StudentAccessService } from '../students/student-access.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    attempt: {
      findMany: jest.Mock;
    };
    question: {
      findMany: jest.Mock;
    };
  };
  let studentAccessService: {
    assertCanAccessStudent: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      attempt: {
        findMany: jest.fn(),
      },
      question: {
        findMany: jest.fn(),
      },
    };
    studentAccessService = {
      assertCanAccessStudent: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: StudentAccessService,
          useValue: studentAccessService,
        },
      ],
    }).compile();

    service = moduleRef.get(ReportsService);
  });

  it('returns student summary with averages and best score', async () => {
    prisma.attempt.findMany.mockResolvedValue([
      createAttempt('attempt-1', 80, 8),
      createAttempt('attempt-2', 60, 6),
    ]);

    await expect(
      service.getStudentSummary('student-1', {
        id: 'student-1',
        role: UserRole.STUDENT,
      }),
    ).resolves.toMatchObject({
      studentId: 'student-1',
      totalFinishedAttempts: 2,
      averagePercentage: 70,
      bestPercentage: 80,
      bestScore: 8,
    });
    expect(studentAccessService.assertCanAccessStudent).toHaveBeenCalledWith(
      'student-1',
      {
        id: 'student-1',
        role: UserRole.STUDENT,
      },
    );
  });

  it('aggregates student performance by discipline', async () => {
    prisma.attempt.findMany.mockResolvedValue([
      createAttempt('attempt-1', 80, 8, 'matematica', 'Matemática'),
      createAttempt('attempt-2', 60, 6, 'matematica', 'Matemática'),
      createAttempt('attempt-3', 90, 9, 'portugues', 'Português'),
    ]);

    await expect(
      service.getStudentByDiscipline('student-1', {
        id: 'guardian-1',
        role: UserRole.GUARDIAN,
      }),
    ).resolves.toEqual([
      {
        disciplineId: 'matematica',
        discipline: 'Matemática',
        attempts: 2,
        averagePercentage: 70,
        bestPercentage: 80,
      },
      {
        disciplineId: 'portugues',
        discipline: 'Português',
        attempts: 1,
        averagePercentage: 90,
        bestPercentage: 90,
      },
    ]);
  });

  it('calculates question error rates', async () => {
    prisma.question.findMany.mockResolvedValue([
      {
        id: 'question-1',
        simulationId: 'simulation-1',
        sortOrder: 1,
        statement: 'Pergunta 1',
        simulation: {
          title: 'Simulado',
          discipline: {
            name: 'Matemática',
          },
        },
        attemptAnswers: [
          { isCorrect: false },
          { isCorrect: false },
          { isCorrect: true },
          { isCorrect: true },
        ],
      },
    ]);

    await expect(service.getQuestionsErrorRate()).resolves.toEqual([
      {
        questionId: 'question-1',
        simulationId: 'simulation-1',
        simulationTitle: 'Simulado',
        discipline: 'Matemática',
        order: 1,
        statement: 'Pergunta 1',
        totalAnswers: 4,
        wrongAnswers: 2,
        errorRate: 50,
      },
    ]);
  });

  function createAttempt(
    id: string,
    percentage: number,
    score: number,
    disciplineId = 'matematica',
    disciplineName = 'Matemática',
  ) {
    return {
      id,
      status: AttemptStatus.FINISHED,
      percentage: new Prisma.Decimal(percentage),
      score: new Prisma.Decimal(score),
      simulation: {
        title: 'Simulado',
        discipline: {
          id: disciplineId,
          name: disciplineName,
        },
      },
    };
  }
});
