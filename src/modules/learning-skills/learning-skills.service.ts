import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivityKind,
  AttemptPracticeMode,
  AttemptStatus,
  LearningSkillStatus,
  Prisma,
  SimulationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { QUIZ_METADATA_SELECT } from '../quizzes/quizzes.presenter';
import { segmentForSchoolYear } from '../learning/learning-calendar';
import { CreateLearningSkillDto } from './dto/learning-skill.dto';
import {
  aggregateEvidence,
  classified,
  evidenceIdentity,
  LearningEvidence,
  skillIdentity,
} from './learning-evidence';

export const QUESTION_SKILL_INCLUDE = {
  skill: { include: { skill: { include: { discipline: true } } } },
} satisfies Prisma.QuestionInclude;
type ClassifiedQuestion = Prisma.QuestionGetPayload<{
  include: typeof QUESTION_SKILL_INCLUDE;
}>;
type ReviewQuiz<Q extends ClassifiedQuestion = ClassifiedQuestion> = {
  id: string;
  activityKey: string | null;
  schoolYear: number;
  disciplineId: string;
  questions: Q[];
};
const RECENT_DIFFICULTY_DAYS = 30;

@Injectable()
export class LearningSkillsService {
  constructor(private readonly prisma: PrismaService) {}
  async assertStudent(database: Prisma.TransactionClient, userId: string) {
    const user = await database.user.findFirst({
      where: {
        id: userId,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: {
        id: true,
        learningPreferences: { select: { schoolYear: true } },
        studentProfile: { select: { schoolYear: true } },
      },
    });
    if (!user) throw new UnauthorizedException('Active student required');
    return user;
  }
  private async assertAdmin(
    database: Prisma.TransactionClient,
    userId: string,
  ) {
    const user = await database.user.findFirst({
      where: {
        id: userId,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!user) throw new UnauthorizedException('Active administrator required');
  }
  async list(userId: string) {
    return this.prisma.$transaction(async (database) => {
      await this.assertAdmin(database, userId);
      return database.learningSkill.findMany({
        where: { deletedAt: null },
        include: {
          discipline: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ code: 'asc' }, { version: 'asc' }],
      });
    });
  }
  async create(dto: CreateLearningSkillDto, userId: string) {
    return this.prisma.$transaction(async (database) => {
      await this.assertAdmin(database, userId);
      await database.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`learning-skill:${dto.code}`}, 0))::text AS "locked"`;
      const discipline = await database.discipline.findFirst({
        where: { id: dto.disciplineId, isActive: true, deletedAt: null },
        select: { id: true, slug: true },
      });
      if (!discipline)
        throw new BadRequestException('Active discipline not found');
      segmentForSchoolYear(dto.schoolYear);
      if (
        (dto.schoolYear === 0 && discipline.slug !== 'enfermagem') ||
        (dto.schoolYear < 0 && !discipline.slug.startsWith('infantil-')) ||
        (dto.schoolYear > 0 &&
          (discipline.slug === 'enfermagem' ||
            discipline.slug.startsWith('infantil-')))
      )
        throw new BadRequestException(
          'Skill discipline is incompatible with school year',
        );
      const versions = await database.learningSkill.findMany({
        where: { code: dto.code },
        orderBy: { version: 'desc' },
        select: { version: true, disciplineId: true, schoolYear: true },
      });
      const version = dto.version ?? 1;
      if (
        versions.some(
          (skill) =>
            skill.disciplineId !== dto.disciplineId ||
            skill.schoolYear !== dto.schoolYear,
        )
      )
        throw new ConflictException(
          'Skill discipline and school year must remain stable across versions',
        );
      if (version !== (versions[0]?.version ?? 0) + 1)
        throw new ConflictException(
          'Skill versions must be consecutive and immutable',
        );
      return database.learningSkill.create({
        data: {
          code: dto.code,
          version,
          title: dto.title,
          description: dto.description,
          disciplineId: dto.disciplineId,
          schoolYear: dto.schoolYear,
        },
      });
    });
  }
  async publish(id: string, userId: string, reviewConfirmed: boolean) {
    if (reviewConfirmed !== true)
      throw new BadRequestException(
        'Editorial review confirmation is required',
      );
    return this.prisma.$transaction(async (database) => {
      await this.assertAdmin(database, userId);
      const rows = await database.$queryRaw<
        { id: string }[]
      >`SELECT "id" FROM "LearningSkill" WHERE "id"=${id} AND "deletedAt" IS NULL FOR UPDATE`;
      if (rows.length !== 1)
        throw new NotFoundException('Learning skill not found');
      const skill = await database.learningSkill.findUniqueOrThrow({
        where: { id },
        include: { discipline: true },
      });
      if (!skill.discipline.isActive || skill.discipline.deletedAt !== null)
        throw new BadRequestException('Active discipline not found');
      if (skill.status === LearningSkillStatus.PUBLISHED) return skill;
      if (
        skill.status !== LearningSkillStatus.DRAFT ||
        skill.publishedAt !== null
      )
        throw new ConflictException(
          'Only a never-published skill draft can be published',
        );
      const now = new Date();
      return database.learningSkill.update({
        where: { id },
        data: {
          status: LearningSkillStatus.PUBLISHED,
          publishedAt: now,
          reviewedBy: userId,
          reviewedAt: now,
        },
      });
    });
  }
  async archive(id: string, userId: string) {
    return this.prisma.$transaction(async (database) => {
      await this.assertAdmin(database, userId);
      const rows = await database.$queryRaw<
        { id: string }[]
      >`SELECT "id" FROM "LearningSkill" WHERE "id"=${id} AND "deletedAt" IS NULL FOR UPDATE`;
      if (rows.length !== 1)
        throw new NotFoundException('Learning skill not found');
      return database.learningSkill.update({
        where: { id },
        data: { status: LearningSkillStatus.ARCHIVED },
      });
    });
  }
  snapshotSkill(
    question: ClassifiedQuestion,
    scope?: { schoolYear: number; disciplineId: string },
  ) {
    const skill = question.skill?.skill;
    if (
      !skill ||
      skill.deletedAt !== null ||
      !skill.discipline.isActive ||
      skill.discipline.deletedAt !== null ||
      (scope !== undefined &&
        (skill.schoolYear !== scope.schoolYear ||
          skill.disciplineId !== scope.disciplineId)) ||
      !skill.reviewedAt ||
      !skill.reviewedBy ||
      !skill.publishedAt ||
      skill.status !== LearningSkillStatus.PUBLISHED
    )
      return {};
    return {
      skillCode: skill.code,
      skillVersion: skill.version,
      skillTitle: skill.title,
      skillDisciplineSlug: skill.discipline.slug,
      skillSchoolYear: skill.schoolYear,
    };
  }
  async readEvidence(
    database: Prisma.TransactionClient,
    userId: string,
  ): Promise<LearningEvidence[]> {
    return database.$queryRaw<LearningEvidence[]>`
      SELECT COALESCE(a."activityKey",a."simulationId") AS "activityKey",COALESCE(s."originKey",aa."questionId") AS "originKey",a."practiceMode",aa."isCorrect",aa."confirmedAt",aa."id" AS "answerId",s."skillCode",s."skillVersion",s."skillTitle",s."skillDisciplineSlug",s."skillSchoolYear"
      FROM "AttemptAnswer" aa JOIN "Attempt" a ON a."id"=aa."attemptId"
      JOIN "Simulation" q ON q."id"=a."simulationId"
      LEFT JOIN "AttemptQuestionSnapshot" s ON s."attemptId"=aa."attemptId" AND s."questionId"=aa."questionId"
      WHERE a."studentId"=${userId} AND a."status"='FINISHED' AND q."activityKind"='QUIZ' AND aa."confirmedAt" IS NOT NULL AND aa."isCorrect" IS NOT NULL
      ORDER BY aa."confirmedAt",aa."id" COLLATE "C"
    `;
  }
  private availableWhere(
    userId: string,
    schoolYear: number,
  ): Prisma.SimulationWhereInput {
    return {
      activityKind: ActivityKind.QUIZ,
      status: SimulationStatus.PUBLISHED,
      deletedAt: null,
      publishedAt: { not: null },
      schoolYear,
      discipline: { isActive: true, deletedAt: null },
      OR: [
        { turmaId: null },
        { turma: { deletedAt: null, memberships: { some: { userId } } } },
      ],
    };
  }
  private difficulties(evidence: LearningEvidence[], now: Date) {
    const latest = new Map<string, LearningEvidence>();
    for (const row of evidence) {
      const key = evidenceIdentity(row);
      const old = latest.get(key);
      if (
        !old ||
        row.confirmedAt > old.confirmedAt ||
        (row.confirmedAt.getTime() === old.confirmedAt.getTime() &&
          row.answerId > old.answerId)
      )
        latest.set(key, row);
    }
    const cutoff = now.getTime() - RECENT_DIFFICULTY_DAYS * 86400000;
    return [...latest.values()].filter(
      (row) =>
        !row.isCorrect &&
        classified(row) &&
        row.confirmedAt.getTime() >= cutoff &&
        row.confirmedAt <= now,
    );
  }
  selectReviewQuestions<Q extends ClassifiedQuestion>(
    quiz: ReviewQuiz<Q>,
    evidence: LearningEvidence[],
    now: Date,
  ) {
    const difficulties = this.difficulties(evidence, now).filter(
      (row) => row.skillSchoolYear === quiz.schoolYear,
    );
    const wrongOrigins = new Set(
      difficulties
        .filter((row) => row.activityKey === quiz.activityKey)
        .map((row) => row.originKey),
    );
    const skillKeys = new Set(difficulties.map(skillIdentity));
    const seen = new Set(
      evidence
        .filter((row) => row.activityKey === quiz.activityKey)
        .map((row) => row.originKey),
    );
    if (!skillKeys.size) return [];
    const candidates = quiz.questions
      .filter((question) => {
        const skill = question.skill?.skill;
        return (
          skill &&
          skill.status === LearningSkillStatus.PUBLISHED &&
          skill.deletedAt === null &&
          skill.publishedAt !== null &&
          skill.reviewedAt !== null &&
          skill.reviewedBy !== null &&
          skill.discipline.isActive &&
          skill.discipline.deletedAt === null &&
          skill.schoolYear === quiz.schoolYear &&
          skill.disciplineId === quiz.disciplineId &&
          skillKeys.has(JSON.stringify([skill.code, skill.version]))
        );
      })
      .sort((a, b) => {
        const priority = (q: ClassifiedQuestion) =>
          !seen.has(q.originKey!) ? 0 : !wrongOrigins.has(q.originKey!) ? 1 : 2;
        return (
          priority(a) - priority(b) ||
          a.sortOrder - b.sortOrder ||
          a.id.localeCompare(b.id)
        );
      });
    return candidates.slice(0, 5).map((question) => ({
      question,
      practicedBefore: seen.has(question.originKey!),
    }));
  }
  async refreshQuestionSkills<Q extends ClassifiedQuestion>(
    database: Prisma.TransactionClient,
    questions: Q[],
  ) {
    const ids = [
      ...new Set(
        questions.flatMap((question) =>
          question.skill ? [question.skill.skill.id] : [],
        ),
      ),
    ].sort();
    if (ids.length) {
      await database.$queryRaw(
        Prisma.sql`SELECT "id" FROM "LearningSkill" WHERE "id" IN (${Prisma.join(ids)}) ORDER BY "id" FOR SHARE`,
      );
      const current = await database.learningSkill.findMany({
        where: { id: { in: ids } },
        include: { discipline: true },
      });
      questions.forEach((question) => {
        if (question.skill) {
          const skill = current.find(
            (row) => row.id === question.skill!.skillId,
          );
          if (skill) question.skill = { ...question.skill, skill };
        }
      });
    }
  }
  async reviewQuestions<Q extends ClassifiedQuestion>(
    database: Prisma.TransactionClient,
    userId: string,
    quiz: ReviewQuiz<Q>,
  ) {
    await this.refreshQuestionSkills(database, quiz.questions);
    const latest = await database.simulation.findFirst({
      where: {
        ...this.availableWhere(userId, quiz.schoolYear),
        activityKey: quiz.activityKey,
      },
      orderBy: { contentVersion: 'desc' },
      select: { id: true },
    });
    if (!latest || latest.id !== quiz.id)
      throw new NotFoundException('Current published quiz not found');
    const evidence = await this.readEvidence(database, userId);
    const selected = this.selectReviewQuestions(quiz, evidence, new Date());
    if (!selected.length)
      throw new NotFoundException(
        'No recent classified difficulties are available for this quiz',
      );
    return selected;
  }
  async progress(userId: string, requestedYear?: number) {
    return this.prisma.$transaction(
      async (database) => {
        const user = await this.assertStudent(database, userId);
        const schoolYear =
          requestedYear ??
          user.learningPreferences?.schoolYear ??
          user.studentProfile?.schoolYear ??
          null;
        if (schoolYear !== null) segmentForSchoolYear(schoolYear);
        const now = new Date();
        const evidence = await this.readEvidence(database, userId);
        const disciplines = await database.discipline.findMany({
          select: { slug: true, name: true },
        });
        const aggregate = aggregateEvidence(
          evidence,
          schoolYear,
          new Map(disciplines.map((d) => [d.slug, d.name])),
        );
        const inProgressReview = await database.attempt.findFirst({
          where: {
            studentId: userId,
            practiceMode: AttemptPracticeMode.REVIEW,
            status: AttemptStatus.IN_PROGRESS,
            simulation: {
              activityKind: ActivityKind.QUIZ,
              deletedAt: null,
              publishedAt: { not: null },
              status: {
                in: [SimulationStatus.PUBLISHED, SimulationStatus.ARCHIVED],
              },
              discipline: { isActive: true, deletedAt: null },
              OR: [
                { turmaId: null },
                {
                  turma: { deletedAt: null, memberships: { some: { userId } } },
                },
              ],
            },
          },
          orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
          select: {
            id: true,
            simulationId: true,
            activityKey: true,
            contentVersion: true,
            practiceMode: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            score: true,
            maxScore: true,
            percentage: true,
            correctCount: true,
            wrongCount: true,
            durationSeconds: true,
            createdAt: true,
            updatedAt: true,
            simulation: { select: QUIZ_METADATA_SELECT },
          },
        });
        const reviewSuggestions = [];
        if (schoolYear !== null) {
          const quizzes = await database.simulation.findMany({
            where: this.availableWhere(userId, schoolYear),
            distinct: ['activityKey'],
            orderBy: [{ activityKey: 'asc' }, { contentVersion: 'desc' }],
            include: {
              questions: {
                where: { isActive: true, deletedAt: null },
                orderBy: { sortOrder: 'asc' },
                include: QUESTION_SKILL_INCLUDE,
              },
            },
          });
          const latestWrong = this.difficulties(evidence, now);
          quizzes.sort((a, b) => {
            const recent = (key: string | null) =>
              Math.max(
                0,
                ...latestWrong
                  .filter((row) => row.activityKey === key)
                  .map((row) => row.confirmedAt.getTime()),
              );
            return (
              recent(b.activityKey) - recent(a.activityKey) ||
              a.id.localeCompare(b.id)
            );
          });
          for (const quiz of quizzes) {
            const selected = this.selectReviewQuestions(quiz, evidence, now);
            if (!selected.length) continue;
            reviewSuggestions.push({
              quizId: quiz.id,
              activityKey: quiz.activityKey!,
              contentVersion: quiz.contentVersion!,
              title: quiz.title,
              schoolYear: quiz.schoolYear,
              questionCount: selected.length,
              skillTitles: [
                ...new Set(
                  selected.map((row) => row.question.skill!.skill.title),
                ),
              ],
              hasRepeatedQuestions: selected.some((row) => row.practicedBefore),
            });
            if (reviewSuggestions.length === 3) break;
          }
        }
        return {
          schoolYear,
          ...aggregate,
          reviewSuggestions,
          inProgressReview,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
}
