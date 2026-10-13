import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AttemptStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { StudentAccessService } from '../students/student-access.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    simulation: {
      findFirst: jest.Mock;
    };
    attempt: {
      findMany: jest.Mock;
    };
    question: {
      findMany: jest.Mock;
    };
  };
  let studentAccessService: {
    assertCanAccessStudent: jest.Mock;
    simulationScope: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      simulation: {
        findFirst: jest.fn().mockResolvedValue({ id: 'simulation-1' }),
      },
      attempt: {
        findMany: jest.fn(),
      },
      question: {
        findMany: jest.fn(),
      },
    };
    studentAccessService = {
      assertCanAccessStudent: jest.fn(),
      simulationScope: jest.fn().mockReturnValue({ deletedAt: null }),
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

  it('restricts teacher summaries to their currently assigned private groups and public activities', async () => {
    const scope = {
      deletedAt: null,
      OR: [
        { turmaId: null },
        {
          turma: {
            deletedAt: null,
            teachers: { some: { teacherId: 'teacher-1' } },
          },
        },
      ],
    };
    studentAccessService.simulationScope.mockReturnValue(scope);
    prisma.attempt.findMany.mockResolvedValue([]);
    await service.getStudentSummary('student-1', {
      id: 'teacher-1',
      role: UserRole.TEACHER,
    });
    expect(prisma.attempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          studentId: 'student-1',
          status: AttemptStatus.FINISHED,
          simulation: { activityKind: 'SIMULATION', ...scope },
        },
      }),
    );
  });

  it('rejects unrelated students before reading any assessment records', async () => {
    studentAccessService.assertCanAccessStudent.mockRejectedValue(
      new Error('Forbidden'),
    );
    await expect(
      service.getStudentByDiscipline('student-1', {
        id: 'teacher-1',
        role: UserRole.TEACHER,
      }),
    ).rejects.toThrow('Forbidden');
    expect(prisma.attempt.findMany).not.toHaveBeenCalled();
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

  it('rejects an inaccessible simulation before querying its attempt data', async () => {
    prisma.simulation.findFirst.mockResolvedValue(null);

    await expect(
      service.getSimulationPerformance('inaccessible-activity'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.attempt.findMany).not.toHaveBeenCalled();
  });

  it('keeps zero performance values for a simulation without finished attempts', async () => {
    prisma.attempt.findMany.mockResolvedValue([]);

    await expect(
      service.getSimulationPerformance('simulation-1'),
    ).resolves.toEqual({
      simulationId: 'simulation-1',
      simulation: null,
      totalFinishedAttempts: 0,
      averagePercentage: 0,
      bestPercentage: 0,
      worstPercentage: 0,
      averageScore: 0,
    });
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
