import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LinkGuardianStudentDto } from './dto/link-guardian-student.dto';

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}

  async linkStudent(dto: LinkGuardianStudentDto) {
    const [guardian, student] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: dto.guardianId,
          role: UserRole.GUARDIAN,
          deletedAt: null,
        },
      }),
      this.prisma.user.findFirst({
        where: {
          id: dto.studentId,
          role: UserRole.STUDENT,
          deletedAt: null,
        },
      }),
    ]);

    if (!guardian) {
      throw new NotFoundException('Guardian not found');
    }

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (guardian.id === student.id) {
      throw new BadRequestException('Guardian and student must be different users');
    }

    return this.prisma.guardianStudent.upsert({
      where: {
        guardianId_studentId: {
          guardianId: dto.guardianId,
          studentId: dto.studentId,
        },
      },
      create: {
        guardianId: dto.guardianId,
        studentId: dto.studentId,
        relationship: dto.relationship.trim(),
      },
      update: {
        relationship: dto.relationship.trim(),
      },
      include: {
        student: {
          include: {
            studentProfile: true,
          },
        },
        guardian: true,
      },
    });
  }

  findMyStudents(guardianId: string) {
    return this.prisma.guardianStudent.findMany({
      where: { guardianId },
      include: {
        student: {
          include: {
            studentProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async unlinkStudent(guardianId: string, studentId: string): Promise<void> {
    const link = await this.prisma.guardianStudent.findUnique({
      where: {
        guardianId_studentId: {
          guardianId,
          studentId,
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Guardian student link not found');
    }

    await this.prisma.guardianStudent.delete({
      where: {
        guardianId_studentId: {
          guardianId,
          studentId,
        },
      },
    });
  }
}
