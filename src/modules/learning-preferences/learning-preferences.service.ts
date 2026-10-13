import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LearningSegment, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateLearningPreferencesDto } from './dto/update-learning-preferences.dto';

export interface PersonalLearningPreferences {
  segment: LearningSegment | null;
  schoolYear: number | null;
  audioEnabled: boolean;
  motionEnabled: boolean;
}

const preferenceSelection = {
  segment: true,
  schoolYear: true,
  audioEnabled: true,
  motionEnabled: true,
} as const;

export const DEFAULT_LEARNING_PREFERENCES: PersonalLearningPreferences = {
  segment: null,
  schoolYear: null,
  audioEnabled: false,
  motionEnabled: true,
};

const schoolYears: Record<LearningSegment, readonly number[]> = {
  INFANTIL: [-1, -2],
  FUNDAMENTAL_I: [1, 2, 3, 4, 5],
  FUNDAMENTAL_II: [6, 7, 8, 9],
  MEDIO: [10, 11, 12],
  ENFERMAGEM: [0],
};

@Injectable()
export class LearningPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<PersonalLearningPreferences> {
    this.assertUserId(userId);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: UserStatus.ACTIVE, deletedAt: null },
      select: {
        learningPreferences: { select: preferenceSelection },
      },
    });
    if (!user) throw new UnauthorizedException('Active user required');
    return user.learningPreferences ?? { ...DEFAULT_LEARNING_PREFERENCES };
  }

  async updateMe(
    userId: string,
    dto: UpdateLearningPreferencesDto,
  ): Promise<PersonalLearningPreferences> {
    this.assertUserId(userId);
    return this.prisma.$transaction(async (tx) => {
      // Lock the parent even before preferences exist: concurrent first writes
      // serialize and merge the latest state without losing unrelated fields.
      const users = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "User"
        WHERE "id" = ${userId} AND "status" = 'ACTIVE' AND "deletedAt" IS NULL
        FOR UPDATE
      `;
      if (!users.length)
        throw new UnauthorizedException('Active user required');

      const current =
        (await tx.learningPreferences.findUnique({
          where: { userId },
          select: preferenceSelection,
        })) ?? DEFAULT_LEARNING_PREFERENCES;
      const merged: PersonalLearningPreferences = {
        segment: dto.segment === undefined ? current.segment : dto.segment,
        schoolYear:
          dto.schoolYear === undefined ? current.schoolYear : dto.schoolYear,
        audioEnabled: dto.audioEnabled ?? current.audioEnabled,
        motionEnabled: dto.motionEnabled ?? current.motionEnabled,
      };
      this.assertCompatible(merged);
      if (
        Object.keys(dto).length === 0 ||
        Object.entries(merged).every(
          ([key, value]) =>
            current[key as keyof PersonalLearningPreferences] === value,
        )
      ) {
        return { ...current };
      }
      return tx.learningPreferences.upsert({
        where: { userId },
        create: { userId, ...merged },
        update: merged,
        select: preferenceSelection,
      });
    });
  }

  private assertUserId(userId: string): void {
    if (typeof userId !== 'string' || userId.length === 0) {
      throw new UnauthorizedException('Active user required');
    }
  }

  private assertCompatible(value: PersonalLearningPreferences): void {
    if (
      value.schoolYear !== null &&
      (value.segment === null ||
        !schoolYears[value.segment].includes(value.schoolYear))
    ) {
      throw new BadRequestException(
        'schoolYear must match the selected segment',
      );
    }
  }
}
