import { Injectable } from '@nestjs/common';
import { AttemptStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RequestUser, StudentAccessService } from '../students/student-access.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentAccessService: StudentAccessService,
  ) {}

  async getStudentSummary(studentId: string, user: RequestUser) {
    await this.studentAccessService.assertCanAccessStudent(studentId, user);

    const attempts = await this.findFinishedAttemptsByStudent(studentId);
    const percentages = attempts.map((attempt) =>
      this.decimalToNumber(attempt.percentage),
    );
    const bestAttempt = attempts.reduce<(typeof attempts)[number] | null>(
      (best, attempt) => {
        if (!best) {
          return attempt;
        }

        return this.decimalToNumber(attempt.percentage) >
          this.decimalToNumber(best.percentage)
          ? attempt
          : best;
      },
      null,
    );

    return {
      studentId,
      totalFinishedAttempts: attempts.length,
      averagePercentage: this.average(percentages),
      bestPercentage: bestAttempt
        ? this.decimalToNumber(bestAttempt.percentage)
        : 0,
      bestScore: bestAttempt ? this.decimalToNumber(bestAttempt.score) : 0,
      lastAttempts: attempts.slice(0, 5),
    };
  }

  async getStudentByDiscipline(studentId: string, user: RequestUser) {
    await this.studentAccessService.assertCanAccessStudent(studentId, user);

    const attempts = await this.findFinishedAttemptsByStudent(studentId);
    const byDiscipline = new Map<
      string,
      {
        disciplineId: string;
        discipline: string;
        attempts: number;
        totalPercentage: number;
        bestPercentage: number;
      }
    >();

    for (const attempt of attempts) {
      const discipline = attempt.simulation.discipline;
      const percentage = this.decimalToNumber(attempt.percentage);
      const current = byDiscipline.get(discipline.id) ?? {
        disciplineId: discipline.id,
        discipline: discipline.name,
        attempts: 0,
        totalPercentage: 0,
        bestPercentage: 0,
      };

      current.attempts += 1;
      current.totalPercentage += percentage;
      current.bestPercentage = Math.max(current.bestPercentage, percentage);
      byDiscipline.set(discipline.id, current);
    }

    return Array.from(byDiscipline.values()).map((item) => ({
      disciplineId: item.disciplineId,
      discipline: item.discipline,
      attempts: item.attempts,
      averagePercentage: Number(
        (item.totalPercentage / item.attempts).toFixed(2),
      ),
      bestPercentage: item.bestPercentage,
    }));
  }

  async getSimulationPerformance(simulationId: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        simulationId,
        status: AttemptStatus.FINISHED,
      },
      include: {
        simulation: {
          include: {
            discipline: true,
          },
        },
      },
      orderBy: { finishedAt: 'desc' },
    });
    const percentages = attempts.map((attempt) =>
      this.decimalToNumber(attempt.percentage),
    );

    return {
      simulationId,
      simulation: attempts[0]?.simulation ?? null,
      totalFinishedAttempts: attempts.length,
      averagePercentage: this.average(percentages),
      bestPercentage: percentages.length > 0 ? Math.max(...percentages) : 0,
      worstPercentage: percentages.length > 0 ? Math.min(...percentages) : 0,
      averageScore: this.average(
        attempts.map((attempt) => this.decimalToNumber(attempt.score)),
      ),
    };
  }

  async getQuestionsErrorRate() {
    const questions = await this.prisma.question.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        simulation: {
          include: {
            discipline: true,
          },
        },
        attemptAnswers: {
          where: {
            attempt: {
              status: AttemptStatus.FINISHED,
            },
          },
        },
      },
      orderBy: [{ simulationId: 'asc' }, { sortOrder: 'asc' }],
    });

    return questions
      .map((question) => {
        const totalAnswers = question.attemptAnswers.length;
        const wrongAnswers = question.attemptAnswers.filter(
          (answer) => answer.isCorrect === false,
        ).length;

        return {
          questionId: question.id,
          simulationId: question.simulationId,
          simulationTitle: question.simulation.title,
          discipline: question.simulation.discipline.name,
          order: question.sortOrder,
          statement: question.statement,
          totalAnswers,
          wrongAnswers,
          errorRate:
            totalAnswers > 0
              ? Number(((wrongAnswers / totalAnswers) * 100).toFixed(2))
              : 0,
        };
      })
      .sort((left, right) => right.errorRate - left.errorRate);
  }

  private findFinishedAttemptsByStudent(studentId: string) {
    return this.prisma.attempt.findMany({
      where: {
        studentId,
        status: AttemptStatus.FINISHED,
      },
      include: {
        simulation: {
          include: {
            discipline: true,
          },
        },
      },
      orderBy: { finishedAt: 'desc' },
    });
  }

  private decimalToNumber(value: Prisma.Decimal | null): number {
    return value?.toNumber() ?? 0;
  }

  private average(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    return Number(
      (values.reduce((total, value) => total + value, 0) / values.length).toFixed(
        2,
      ),
    );
  }
}
