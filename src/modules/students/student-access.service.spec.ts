import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { StudentAccessService } from './student-access.service';

describe('StudentAccessService', () => {
  const prisma = {
    user: { findFirst: jest.fn(), findMany: jest.fn() },
    guardianStudent: { findUnique: jest.fn() },
    teacherTurma: { findFirst: jest.fn() },
  };
  const service = new StudentAccessService(prisma as unknown as PrismaService);
  beforeEach(() => {
    jest.resetAllMocks();
    prisma.user.findFirst.mockResolvedValue({ id: 'active-user' });
    prisma.user.findMany.mockResolvedValue([]);
  });
  it('allows only active students to access their own data', async () => {
    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'student-1',
        role: UserRole.STUDENT,
      }),
    ).resolves.toBeUndefined();
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'student-1',
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
      }),
    );
  });
  it('checks active current roles before accepting any administrator bypass', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'old-admin',
        role: UserRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.guardianStudent.findUnique).not.toHaveBeenCalled();
  });
  it('hides inactive, deleted and role-changed student targets', async () => {
    prisma.user.findFirst
      .mockResolvedValueOnce({ id: 'admin' })
      .mockResolvedValueOnce(null);
    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'admin',
        role: UserRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('requires a current guardian link for every request', async () => {
    const guardian = { id: 'guardian-1', role: UserRole.GUARDIAN };
    prisma.guardianStudent.findUnique.mockResolvedValue({
      studentId: 'student-1',
    });
    await expect(
      service.assertCanAccessStudent('student-1', guardian),
    ).resolves.toBeUndefined();
    prisma.guardianStudent.findUnique.mockResolvedValue(null);
    await expect(
      service.assertCanAccessStudent('student-1', guardian),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('requires a teacher assignment and current student membership in an active turma', async () => {
    const teacher = { id: 'teacher-1', role: UserRole.TEACHER };
    prisma.teacherTurma.findFirst.mockResolvedValue({ turmaId: 'assigned' });
    await expect(
      service.assertCanAccessStudent('student-1', teacher),
    ).resolves.toBeUndefined();
    expect(prisma.teacherTurma.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          teacherId: 'teacher-1',
          turma: {
            deletedAt: null,
            memberships: { some: { userId: 'student-1' } },
          },
        },
      }),
    );
    prisma.teacherTurma.findFirst.mockResolvedValue(null);
    await expect(
      service.assertCanAccessStudent('student-1', teacher),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('does not let another student read the target account', async () => {
    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'student-2',
        role: UserRole.STUDENT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('scopes teachers to public and currently assigned private activities', () => {
    expect(
      service.simulationScope({ id: 'teacher-1', role: UserRole.TEACHER }),
    ).toEqual({
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
    });
    expect(
      service.simulationScope({ id: 'guardian-1', role: UserRole.GUARDIAN }),
    ).toEqual({ deletedAt: null });
  });
  it('projects a minimal roster without child email, tokens or answers', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'student-1',
        name: 'Aluno',
        studentProfile: null,
        turmaMemberships: [
          { turma: { id: 'turma-1', name: 'Turma', slug: 'turma' } },
        ],
      },
    ]);
    await expect(
      service.oversightStudents({ id: 'teacher-1', role: UserRole.TEACHER }),
    ).resolves.toEqual([
      {
        id: 'student-1',
        name: 'Aluno',
        schoolYear: null,
        turmas: [{ id: 'turma-1', name: 'Turma', slug: 'turma' }],
      },
    ]);
    const query = prisma.user.findMany.mock.calls[0][0];
    expect(query.where).toMatchObject({
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      deletedAt: null,
      turmaMemberships: {
        some: { turma: { teachers: { some: { teacherId: 'teacher-1' } } } },
      },
    });
    expect(query.select).not.toHaveProperty('email');
    expect(query.select).not.toHaveProperty('passwordHash');
  });
  it('does not expose the oversight roster to students', async () => {
    await expect(
      service.oversightStudents({ id: 'student-1', role: UserRole.STUDENT }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });
});
