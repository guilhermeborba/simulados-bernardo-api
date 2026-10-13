import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivityKind,
  MissionStatus,
  Prisma,
  SimulationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import {
  learningDay,
  missionWeek,
  segmentForSchoolYear,
} from './learning-calendar';

const adminInclude = {
  activities: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.MissionInclude;
type CuratedMission = Prisma.MissionGetPayload<{
  include: typeof adminInclude;
}>;

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(actorId: string) {
    await this.assertAdmin(this.prisma, actorId);
    return this.prisma.mission.findMany({
      where: { deletedAt: null },
      include: adminInclude,
      orderBy: [{ startsAt: 'desc' }, { schoolYear: 'asc' }, { slot: 'asc' }],
    });
  }

  async findOne(id: string, actorId: string) {
    await this.assertAdmin(this.prisma, actorId);
    return this.missionOrThrow(this.prisma, id);
  }

  create(dto: CreateMissionDto, actorId: string) {
    return this.transaction(async (database) => {
      await this.assertAdmin(database, actorId);
      await this.assertDefinition(database, dto, false);
      return database.mission.create({
        data: {
          title: dto.title.trim(),
          description: dto.description.trim(),
          segment: dto.segment,
          schoolYear: dto.schoolYear,
          ...missionWeek(dto.weekStart),
          slot: dto.slot,
          turmaId: dto.turmaId ?? null,
          createdById: actorId,
          activities: {
            create: dto.activityKeys.map((activityKey, index) => ({
              activityKey,
              sortOrder: index + 1,
            })),
          },
        },
        include: adminInclude,
      });
    });
  }

  update(id: string, dto: UpdateMissionDto, actorId: string) {
    return this.withLockedMission(id, actorId, async (database, current) => {
      this.assertDraft(current);
      const definition: CreateMissionDto = {
        title: dto.title ?? current.title,
        description: dto.description ?? current.description,
        segment: dto.segment ?? current.segment,
        schoolYear: dto.schoolYear ?? current.schoolYear,
        weekStart: dto.weekStart ?? learningDay(current.startsAt),
        slot: dto.slot ?? current.slot,
        turmaId: dto.turmaId === undefined ? current.turmaId : dto.turmaId,
        activityKeys:
          dto.activityKeys ??
          current.activities.map((activity) => activity.activityKey),
      };
      await this.assertDefinition(database, definition, false);
      if (dto.activityKeys !== undefined) {
        await database.missionActivity.deleteMany({ where: { missionId: id } });
      }
      return database.mission.update({
        where: { id },
        data: {
          title: definition.title.trim(),
          description: definition.description.trim(),
          segment: definition.segment,
          schoolYear: definition.schoolYear,
          ...missionWeek(definition.weekStart),
          slot: definition.slot,
          turmaId: definition.turmaId ?? null,
          ...(dto.activityKeys !== undefined
            ? {
                activities: {
                  create: definition.activityKeys.map((activityKey, index) => ({
                    activityKey,
                    sortOrder: index + 1,
                  })),
                },
              }
            : {}),
        },
        include: adminInclude,
      });
    });
  }

  publish(id: string, actorId: string) {
    return this.withLockedMission(id, actorId, async (database, mission) => {
      if (mission.status === MissionStatus.PUBLISHED) return mission;
      this.assertDraft(mission);
      if (mission.endsAt <= new Date())
        throw new BadRequestException('Cannot publish an expired mission week');
      const definition: CreateMissionDto = {
        title: mission.title,
        description: mission.description,
        segment: mission.segment,
        schoolYear: mission.schoolYear,
        weekStart: learningDay(mission.startsAt),
        slot: mission.slot,
        turmaId: mission.turmaId,
        activityKeys: mission.activities.map(
          (activity) => activity.activityKey,
        ),
      };
      // Shared locks on referenced activities serialize publication against quiz
      // archiving while allowing simultaneous learner finishes to read content.
      const quizzes = await this.definitionQuizzes(database, definition, true);
      if (quizzes.length) {
        await database.$queryRaw(Prisma.sql`
          SELECT "id" FROM "Simulation" WHERE "id" IN (${Prisma.join(quizzes.map((quiz) => quiz.id))})
          ORDER BY "id" FOR SHARE
        `);
      }
      await this.assertDefinition(database, definition, true);
      return database.mission.update({
        where: { id },
        data: { status: MissionStatus.PUBLISHED, publishedAt: new Date() },
        include: adminInclude,
      });
    });
  }

  archive(id: string, actorId: string) {
    return this.withLockedMission(id, actorId, (database) =>
      database.mission.update({
        where: { id },
        data: { status: MissionStatus.ARCHIVED },
        include: adminInclude,
      }),
    );
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    await this.withLockedMission(id, actorId, (database) =>
      database.mission.update({
        where: { id },
        data: { status: MissionStatus.ARCHIVED, deletedAt: new Date() },
      }),
    );
  }

  private async assertAdmin(
    database: Prisma.TransactionClient,
    actorId: string,
  ) {
    const actor = await database.user.findFirst({
      where: {
        id: actorId,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!actor)
      throw new UnauthorizedException('Active administrator required');
  }

  private async assertDefinition(
    database: Prisma.TransactionClient,
    dto: CreateMissionDto,
    published: boolean,
  ) {
    const week = missionWeek(dto.weekStart);
    if (segmentForSchoolYear(dto.schoolYear) !== dto.segment)
      throw new BadRequestException(
        'schoolYear must match the mission segment',
      );
    if (
      ![1, 2].includes(dto.slot) ||
      !dto.activityKeys.length ||
      dto.activityKeys.length > 5 ||
      new Set(dto.activityKeys).size !== dto.activityKeys.length
    ) {
      throw new BadRequestException(
        'Mission must have one to five unique activities and slot 1 or 2',
      );
    }
    if (published && week.endsAt <= new Date())
      throw new BadRequestException('Cannot publish an expired mission week');
    if (dto.turmaId) {
      const turma = await database.turma.findFirst({
        where: { id: dto.turmaId, deletedAt: null },
        select: { schoolYear: true },
      });
      if (
        !turma ||
        (turma.schoolYear !== null && turma.schoolYear !== dto.schoolYear)
      )
        throw new BadRequestException(
          'Active turma must match the mission schoolYear',
        );
    }
    const quizzes = await this.definitionQuizzes(database, dto, published);
    const keys = new Set(quizzes.map((quiz) => quiz.activityKey));
    if (dto.activityKeys.some((key) => !keys.has(key)))
      throw new BadRequestException(
        published
          ? 'Publish only missions whose quizzes are published, available and match the audience'
          : 'Mission quizzes must exist and match the audience',
      );
  }

  private definitionQuizzes(
    database: Prisma.TransactionClient,
    dto: CreateMissionDto,
    published: boolean,
  ) {
    return database.simulation.findMany({
      where: {
        activityKind: ActivityKind.QUIZ,
        activityKey: { in: dto.activityKeys },
        schoolYear: dto.schoolYear,
        deletedAt: null,
        discipline: { isActive: true, deletedAt: null },
        status: published
          ? SimulationStatus.PUBLISHED
          : { in: [SimulationStatus.DRAFT, SimulationStatus.PUBLISHED] },
        ...(published ? { publishedAt: { not: null } } : {}),
        OR: [
          { turmaId: null },
          ...(dto.turmaId
            ? [{ turmaId: dto.turmaId, turma: { deletedAt: null } }]
            : []),
        ],
      },
      select: { id: true, activityKey: true },
      distinct: ['activityKey'],
      orderBy: [{ activityKey: 'asc' }, { contentVersion: 'desc' }],
    });
  }

  private assertDraft(mission: CuratedMission) {
    if (mission.status !== MissionStatus.DRAFT || mission.publishedAt !== null)
      throw new ConflictException(
        'Published mission content is immutable; create a replacement draft',
      );
  }

  private async missionOrThrow(database: Prisma.TransactionClient, id: string) {
    const mission = await database.mission.findFirst({
      where: { id, deletedAt: null },
      include: adminInclude,
    });
    if (!mission) throw new NotFoundException('Mission not found');
    return mission;
  }

  private withLockedMission<T>(
    id: string,
    actorId: string,
    operation: (
      database: Prisma.TransactionClient,
      mission: CuratedMission,
    ) => Promise<T>,
  ) {
    return this.transaction(async (database) => {
      await this.assertAdmin(database, actorId);
      const rows = await database.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Mission" WHERE "id" = ${id} AND "deletedAt" IS NULL FOR UPDATE
      `;
      if (!rows.length) throw new NotFoundException('Mission not found');
      return operation(database, await this.missionOrThrow(database, id));
    });
  }

  private async transaction<T>(
    operation: (database: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(operation, {
        maxWait: 10_000,
        timeout: 15_000,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ConflictException(
          'A published mission already occupies this weekly audience slot',
        );
      throw error;
    }
  }
}
