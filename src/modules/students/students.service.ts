import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AttemptStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { RequestUser, StudentAccessService } from './student-access.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentAccessService: StudentAccessService,
  ) {}

  async getMe(user: RequestUser) {
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Current user is not a student');
    }

    return this.getStudent(user.id, user);
  }

  async updateMe(user: RequestUser, dto: UpdateStudentProfileDto) {
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Current user is not a student');
    }

    return this.upsertProfile(user.id, dto);
  }

  async getStudent(studentId: string, user: RequestUser) {
    await this.studentAccessService.assertCanAccessStudent(studentId, user);

    const student = await this.prisma.user.findFirst({
      where: {
        id: studentId,
        role: UserRole.STUDENT,
        deletedAt: null,
      },
      include: {
        studentProfile: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async getAttempts(studentId: string, user: RequestUser) {
    await this.studentAccessService.assertCanAccessStudent(studentId, user);

    return this.prisma.attempt.findMany({
      where: { studentId },
      include: {
        simulation: {
          include: {
            discipline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPerformance(studentId: string, user: RequestUser) {
    await this.studentAccessService.assertCanAccessStudent(studentId, user);

    const finishedAttempts = await this.prisma.attempt.findMany({
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

    const bestBySimulation = new Map<
      string,
      {
        simulationId: string;
        simulationTitle: string;
        discipline: string;
        bestScore: number;
        bestPercentage: number;
      }
    >();
    const byDiscipline = new Map<
      string,
      {
        discipline: string;
        attempts: number;
        totalPercentage: number;
        bestPercentage: number;
      }
    >();

    for (const attempt of finishedAttempts) {
      const percentage = this.decimalToNumber(attempt.percentage);
      const score = this.decimalToNumber(attempt.score);
      const best = bestBySimulation.get(attempt.simulationId);

      if (!best || percentage > best.bestPercentage) {
        bestBySimulation.set(attempt.simulationId, {
          simulationId: attempt.simulationId,
          simulationTitle: attempt.simulation.title,
          discipline: attempt.simulation.discipline.name,
          bestScore: score,
          bestPercentage: percentage,
        });
      }

      const discipline = byDiscipline.get(attempt.simulation.discipline.slug) ?? {
        discipline: attempt.simulation.discipline.name,
        attempts: 0,
        totalPercentage: 0,
        bestPercentage: 0,
      };
      discipline.attempts += 1;
      discipline.totalPercentage += percentage;
      discipline.bestPercentage = Math.max(discipline.bestPercentage, percentage);
      byDiscipline.set(attempt.simulation.discipline.slug, discipline);
    }

    const averagePercentage =
      finishedAttempts.length > 0
        ? Number(
            (
              finishedAttempts.reduce(
                (total, attempt) => total + this.decimalToNumber(attempt.percentage),
                0,
              ) / finishedAttempts.length
            ).toFixed(2),
          )
        : 0;

    return {
      totalFinishedAttempts: finishedAttempts.length,
      averagePercentage,
      bestBySimulation: Array.from(bestBySimulation.values()),
      byDiscipline: Array.from(byDiscipline.values()).map((item) => ({
        discipline: item.discipline,
        attempts: item.attempts,
        averagePercentage: Number((item.totalPercentage / item.attempts).toFixed(2)),
        bestPercentage: item.bestPercentage,
      })),
      recentAttempts: finishedAttempts.slice(0, 5),
    };
  }

  private async upsertProfile(studentId: string, dto: UpdateStudentProfileDto) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: studentId,
        role: UserRole.STUDENT,
        deletedAt: null,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const profileData: Prisma.StudentProfileUncheckedCreateInput = {
      userId: studentId,
      schoolYear: dto.schoolYear ?? 3,
      className: dto.className?.trim(),
      schoolName: dto.schoolName?.trim(),
      avatarUrl: dto.avatarUrl,
    };

    return this.prisma.studentProfile.upsert({
      where: { userId: studentId },
      create: profileData,
      update: {
        ...(dto.schoolYear !== undefined ? { schoolYear: dto.schoolYear } : {}),
        ...(dto.className !== undefined ? { className: dto.className?.trim() } : {}),
        ...(dto.schoolName !== undefined ? { schoolName: dto.schoolName?.trim() } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
    });
  }

  private decimalToNumber(value: Prisma.Decimal | null): number {
    return value?.toNumber() ?? 0;
  }
}
