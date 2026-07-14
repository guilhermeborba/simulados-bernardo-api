import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { StudentAccessService } from './student-access.service';

describe('StudentAccessService', () => {
  let service: StudentAccessService;
  let prisma: {
    guardianStudent: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      guardianStudent: {
        findUnique: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StudentAccessService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(StudentAccessService);
  });

  it('allows students to access their own data', async () => {
    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'student-1',
        role: UserRole.STUDENT,
      }),
    ).resolves.toBeUndefined();
  });

  it('allows linked guardians to access student data', async () => {
    prisma.guardianStudent.findUnique.mockResolvedValue({
      guardianId: 'guardian-1',
      studentId: 'student-1',
    });

    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'guardian-1',
        role: UserRole.GUARDIAN,
      }),
    ).resolves.toBeUndefined();
  });

  it('blocks unrelated guardians', async () => {
    prisma.guardianStudent.findUnique.mockResolvedValue(null);

    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'guardian-1',
        role: UserRole.GUARDIAN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks teachers without modeled authorization', async () => {
    await expect(
      service.assertCanAccessStudent('student-1', {
        id: 'teacher-1',
        role: UserRole.TEACHER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
