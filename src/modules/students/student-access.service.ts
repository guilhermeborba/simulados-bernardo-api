import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

export interface RequestUser {
  id: string;
  role: UserRole;
}

@Injectable()
export class StudentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanAccessStudent(studentId: string, user: RequestUser) {
    if (user.role === UserRole.ADMIN || user.id === studentId) {
      return;
    }

    if (user.role === UserRole.GUARDIAN) {
      const link = await this.prisma.guardianStudent.findUnique({
        where: {
          guardianId_studentId: {
            guardianId: user.id,
            studentId,
          },
        },
      });

      if (link) {
        return;
      }
    }

    throw new ForbiddenException('Cannot access this student');
  }
}
