import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

export interface RequestUser {
  id: string;
  role: UserRole;
}

@Injectable()
export class StudentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertActiveUser(
    user: RequestUser,
    database: Prisma.TransactionClient = this.prisma,
  ) {
    const current = await database.user.findFirst({
      where: {
        id: user.id,
        role: user.role,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!current)
      throw new UnauthorizedException(
        'Active account with current role required',
      );
  }

  async assertCanAccessStudent(
    studentId: string,
    user: RequestUser,
    database: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await this.assertActiveUser(user, database);
    const student = await database.user.findFirst({
      where: {
        id: studentId,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    if (
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.STUDENT && user.id === studentId)
    )
      return;
    if (user.role === UserRole.GUARDIAN) {
      const link = await database.guardianStudent.findUnique({
        where: { guardianId_studentId: { guardianId: user.id, studentId } },
      });
      if (link) return;
    }
    if (user.role === UserRole.TEACHER) {
      const link = await database.teacherTurma.findFirst({
        where: {
          teacherId: user.id,
          turma: {
            deletedAt: null,
            memberships: { some: { userId: studentId } },
          },
        },
        select: { turmaId: true },
      });
      if (link) return;
    }
    throw new ForbiddenException('Cannot access this student');
  }

  /** Teachers see public activities and only the private groups currently assigned to them. */
  simulationScope(user: RequestUser): Prisma.SimulationWhereInput {
    return {
      deletedAt: null,
      ...(user.role === UserRole.TEACHER
        ? {
            OR: [
              { turmaId: null },
              {
                turma: {
                  deletedAt: null,
                  teachers: { some: { teacherId: user.id } },
                },
              },
            ],
          }
        : {}),
    };
  }

  async oversightStudents(user: RequestUser) {
    await this.assertActiveUser(user);
    if (
      user.role !== UserRole.GUARDIAN &&
      user.role !== UserRole.TEACHER &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Guardian or teacher account required');
    }
    const students = await this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        deletedAt: null,
        ...(user.role === UserRole.GUARDIAN
          ? { studentGuardianLinks: { some: { guardianId: user.id } } }
          : {}),
        ...(user.role === UserRole.TEACHER
          ? {
              turmaMemberships: {
                some: {
                  turma: {
                    deletedAt: null,
                    teachers: { some: { teacherId: user.id } },
                  },
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        studentProfile: { select: { schoolYear: true } },
        turmaMemberships: {
          where: {
            turma: {
              deletedAt: null,
              ...(user.role === UserRole.TEACHER
                ? { teachers: { some: { teacherId: user.id } } }
                : {}),
            },
          },
          select: { turma: { select: { id: true, name: true, slug: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return students.map((student) => ({
      id: student.id,
      name: student.name,
      schoolYear: student.studentProfile?.schoolYear ?? null,
      turmas: student.turmaMemberships.map((membership) => membership.turma),
    }));
  }
}
