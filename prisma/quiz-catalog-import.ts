import {
  ActivityKind,
  Prisma,
  PrismaClient,
  QuestionType,
  SimulationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { slugify } from '../src/common/utils/slugify';
import {
  CatalogQuiz,
  QuizCatalogError,
  catalogContentHash,
  validateQuizCatalog,
} from './quiz-catalog';
import { QUIZ_PRIVATE_INCLUDE } from '../src/modules/quizzes/quizzes.presenter';

type SavedQuiz = Prisma.SimulationGetPayload<{
  include: typeof QUIZ_PRIVATE_INCLUDE;
}>;
interface References {
  disciplineId: string;
  turmaId: string | null;
}
export interface QuizImportOptions {
  authorEmail: string;
  publishReviewed?: boolean;
}
export interface QuizImportResult {
  created: number;
  unchanged: number;
  published: number;
}

function contentProjection(quiz: CatalogQuiz, references: References) {
  return {
    title: quiz.title,
    subtitle: quiz.subtitle,
    schoolYear: quiz.schoolYear,
    topic: quiz.topic,
    disciplineId: references.disciplineId,
    turmaId: references.turmaId,
    estimatedDurationMinutes: quiz.estimatedDurationMinutes,
    totalQuestions: quiz.questions.length,
    maxScore: quiz.questions
      .reduce(
        (sum, question) => sum.plus(question.points),
        new Prisma.Decimal(0),
      )
      .toFixed(2),
    questions: quiz.questions.map((question, index) => ({
      originKey: question.originKey,
      type: QuestionType.MULTIPLE_CHOICE,
      statement: question.statement,
      explanation: question.explanation,
      tip: question.tip,
      funFact: question.funFact,
      media: question.media,
      points: new Prisma.Decimal(question.points).toFixed(2),
      sortOrder: index + 1,
      options: question.options.map((option, optionIndex) => ({
        ...option,
        sortOrder: optionIndex + 1,
      })),
      answers: [
        { answerKey: 'correctAnswer', answerValue: question.correctAnswer },
      ],
    })),
  };
}
function savedProjection(quiz: SavedQuiz) {
  return {
    title: quiz.title,
    subtitle: quiz.subtitle,
    schoolYear: quiz.schoolYear,
    topic: quiz.topic,
    disciplineId: quiz.disciplineId,
    turmaId: quiz.turmaId,
    estimatedDurationMinutes: quiz.estimatedDurationMinutes,
    totalQuestions: quiz.totalQuestions,
    maxScore: quiz.maxScore.toFixed(2),
    questions: quiz.questions.map((question) => ({
      originKey: question.originKey,
      type: question.type,
      statement: question.statement,
      explanation: question.explanation,
      tip: question.tip,
      funFact: question.funFact,
      media: question.media,
      points: question.points.toFixed(2),
      sortOrder: question.sortOrder,
      options: question.options.map((option) => ({
        optionKey: option.optionKey,
        text: option.text,
        sortOrder: option.sortOrder,
      })),
      answers: question.answers.map((answer) => ({
        answerKey: answer.answerKey,
        answerValue: answer.answerValue,
      })),
    })),
  };
}
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
class RetryImportError extends Error {}
function error(message: string): never {
  throw new QuizCatalogError(message);
}

// The caller must supply the normalized result of validateQuizCatalog/readQuizCatalog.
// No credentials, official answers or raw Prisma errors escape this function.
export async function importQuizCatalog(
  prisma: PrismaClient,
  catalog: CatalogQuiz[],
  options: QuizImportOptions,
): Promise<QuizImportResult> {
  if (
    !options.authorEmail?.trim() ||
    options.authorEmail !== options.authorEmail.trim()
  )
    error('QUIZ_SEED_AUTHOR_EMAIL deve identificar um ADMIN ativo existente.');
  const sorted = validateQuizCatalog(
    catalog.map((quiz) => ({
      activityKey: quiz.activityKey,
      contentVersion: quiz.contentVersion,
      disciplineSlug: quiz.disciplineSlug,
      schoolYear: quiz.schoolYear,
      topic: quiz.topic,
      title: quiz.title,
      subtitle: quiz.subtitle,
      estimatedDurationMinutes: quiz.estimatedDurationMinutes,
      turmaSlug: quiz.turmaSlug,
      sources: quiz.sources,
      review: quiz.review,
      questions: quiz.questions.map((question) => ({
        ...question,
        media:
          question.media === null
            ? null
            : {
                ...(question.media.image
                  ? {
                      image: {
                        assetId: question.media.image.assetId,
                        alt: question.media.image.alt,
                      },
                    }
                  : {}),
                ...(question.media.audio
                  ? {
                      audio: {
                        assetId: question.media.audio.assetId,
                        transcript: question.media.audio.transcript,
                      },
                    }
                  : {}),
              },
      })),
    })),
  );
  const suppliedHashes = new Map(
    catalog.map((quiz) => [
      `${quiz.activityKey}:${quiz.contentVersion}`,
      quiz.contentHash,
    ]),
  );
  if (
    sorted.some(
      (quiz) =>
        suppliedHashes.get(`${quiz.activityKey}:${quiz.contentVersion}`) !==
        quiz.contentHash,
    )
  )
    error('Catálogo normalizado foi alterado; execute a validação novamente.');
  if (!sorted.length) error('Catálogo de quizzes vazio.');
  const identities = new Set<string>();
  for (const quiz of sorted) {
    const { review: _review, contentHash, ...content } = quiz;
    void _review;
    if (
      catalogContentHash(content) !== contentHash ||
      identities.has(`${quiz.activityKey}:${quiz.contentVersion}`)
    )
      error(
        'Catálogo normalizado foi alterado; execute a validação novamente.',
      );
    identities.add(`${quiz.activityKey}:${quiz.contentVersion}`);
  }
  if (
    options.publishReviewed &&
    sorted.some(
      (quiz) =>
        quiz.review.status !== 'APPROVED' ||
        quiz.review.contentHash !== quiz.contentHash ||
        !quiz.review.reviewedBy ||
        !quiz.review.reviewedAt,
    )
  )
    error(
      'Publicação bloqueada: todos os quizzes do lote precisam de revisão APPROVED, responsável, data e hash atual.',
    );
  for (let retry = 0; retry < 4; retry++) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const activityKeys = [
            ...new Set(sorted.map((quiz) => quiz.activityKey)),
          ];
          // Match createVersion's row-before-advisory ordering. Lock every extant
          // version before key locks so a concurrent API version cannot deadlock.
          const lockedRows = await transaction.$queryRaw<
            { id: string }[]
          >(Prisma.sql`
        SELECT "id" FROM "Simulation"
        WHERE "activityKind" = 'QUIZ' AND "activityKey" IN (${Prisma.join(activityKeys)})
        ORDER BY "activityKey", "contentVersion", "id" FOR UPDATE
      `);
          for (const activityKey of activityKeys) {
            await transaction.$queryRaw(Prisma.sql`
          SELECT pg_advisory_xact_lock(hashtextextended(${activityKey}, 0))::text AS "locked"
        `);
          }
          const [author] = await transaction.$queryRaw<
            { id: string }[]
          >(Prisma.sql`
            SELECT "id" FROM "User" WHERE "email" = ${options.authorEmail}
              AND "role" = ${UserRole.ADMIN}::"UserRole"
              AND "status" = ${UserStatus.ACTIVE}::"UserStatus"
              AND "deletedAt" IS NULL FOR SHARE
          `);
          if (!author)
            error('Autor de quizzes deve ser um ADMIN ativo existente.');
          const existing = await transaction.simulation.findMany({
            where: {
              activityKind: ActivityKind.QUIZ,
              activityKey: { in: activityKeys },
            },
            include: QUIZ_PRIVATE_INCLUDE,
          });
          const lockedIds = new Set(lockedRows.map((row) => row.id));
          if (existing.some((quiz) => !lockedIds.has(quiz.id)))
            throw new RetryImportError();
          const byIdentity = new Map(
            existing.map((quiz) => [
              `${quiz.activityKey}:${quiz.contentVersion}`,
              quiz,
            ]),
          );
          const latest = new Map<string, number>();
          for (const quiz of existing)
            latest.set(
              quiz.activityKey!,
              Math.max(
                latest.get(quiz.activityKey!) ?? 0,
                quiz.contentVersion!,
              ),
            );
          const plan: {
            quiz: CatalogQuiz;
            references: References;
            existing: SavedQuiz | undefined;
          }[] = [];
          // Validate the complete batch before the first mutation, within its locks.
          for (const quiz of sorted) {
            const [discipline] = await transaction.$queryRaw<
              { id: string }[]
            >(Prisma.sql`
              SELECT "id" FROM "Discipline" WHERE "slug" = ${quiz.disciplineSlug}
                AND "isActive" = true AND "deletedAt" IS NULL FOR SHARE
            `);
            if (!discipline)
              error(`Disciplina ativa inexistente para ${quiz.activityKey}.`);
            let turmaId: string | null = null;
            if (quiz.turmaSlug) {
              const [turma] = await transaction.$queryRaw<
                { id: string }[]
              >(Prisma.sql`
                SELECT "id" FROM "Turma" WHERE "slug" = ${quiz.turmaSlug}
                  AND "deletedAt" IS NULL FOR SHARE
              `);
              if (!turma)
                error(`Turma ativa inexistente para ${quiz.activityKey}.`);
              turmaId = turma.id;
            }
            const references = { disciplineId: discipline.id, turmaId };
            const saved = byIdentity.get(
              `${quiz.activityKey}:${quiz.contentVersion}`,
            );
            if (saved) {
              if (
                stableJson(savedProjection(saved)) !==
                stableJson(contentProjection(quiz, references))
              )
                error(
                  `Conteúdo de ${quiz.activityKey} v${quiz.contentVersion} diverge do banco; crie uma nova versão.`,
                );
            } else {
              if (
                quiz.contentVersion !==
                (latest.get(quiz.activityKey) ?? 0) + 1
              )
                error(
                  `Versão de ${quiz.activityKey} deve ser consecutiva à última versão existente.`,
                );
              latest.set(quiz.activityKey, quiz.contentVersion);
            }
            plan.push({ quiz, references, existing: saved });
          }
          const result = { created: 0, unchanged: 0, published: 0 };
          for (const entry of plan) {
            const { quiz, references, existing: saved } = entry;
            if (saved) {
              result.unchanged++;
              if (
                options.publishReviewed &&
                saved.status === SimulationStatus.DRAFT &&
                saved.publishedAt === null &&
                saved.deletedAt === null
              ) {
                await transaction.simulation.update({
                  where: { id: saved.id },
                  data: {
                    status: SimulationStatus.PUBLISHED,
                    publishedAt: new Date(),
                  },
                });
                result.published++;
              }
              continue;
            }
            const projection = contentProjection(quiz, references);
            await transaction.simulation.create({
              data: {
                activityKind: ActivityKind.QUIZ,
                activityKey: quiz.activityKey,
                contentVersion: quiz.contentVersion,
                slug: slugify(
                  `quiz-${quiz.activityKey}-v${quiz.contentVersion}`,
                ),
                title: quiz.title,
                subtitle: quiz.subtitle,
                schoolYear: quiz.schoolYear,
                topic: quiz.topic,
                disciplineId: references.disciplineId,
                turmaId: references.turmaId,
                estimatedDurationMinutes: quiz.estimatedDurationMinutes,
                totalQuestions: projection.totalQuestions,
                maxScore: new Prisma.Decimal(projection.maxScore),
                createdById: author.id,
                bimester: null,
                assessment: null,
                status: options.publishReviewed
                  ? SimulationStatus.PUBLISHED
                  : SimulationStatus.DRAFT,
                publishedAt: options.publishReviewed ? new Date() : null,
                questions: {
                  create: projection.questions.map(
                    (
                      question,
                    ): Prisma.QuestionCreateWithoutSimulationInput => ({
                      originKey: question.originKey,
                      type: question.type,
                      statement: question.statement,
                      explanation: question.explanation,
                      tip: question.tip,
                      funFact: question.funFact,
                      media:
                        question.media === null
                          ? Prisma.DbNull
                          : (question.media as unknown as Prisma.InputJsonValue),
                      points: new Prisma.Decimal(question.points),
                      sortOrder: question.sortOrder,
                      options: { create: question.options },
                      answers: { create: question.answers },
                    }),
                  ),
                },
              },
            });
            result.created++;
            if (options.publishReviewed) result.published++;
          }
          return result;
        },
        { maxWait: 15000, timeout: 60000 },
      );
    } catch (caught) {
      if (caught instanceof RetryImportError && retry < 3) continue;
      if (
        caught instanceof Prisma.PrismaClientKnownRequestError &&
        caught.code === 'P2034' &&
        retry < 3
      )
        continue;
      if (caught instanceof QuizCatalogError) throw caught;
      if (
        caught instanceof Prisma.PrismaClientKnownRequestError &&
        caught.code === 'P2002'
      )
        error(
          'Importação bloqueada: identidade, versão ou slug já existe. Nenhuma alteração foi mantida.',
        );
      error(
        'Importação de quizzes falhou. Nenhuma alteração foi mantida; verifique a conexão e as referências.',
      );
    }
  }
  return error(
    'Importação concorrente não pôde concluir; tente novamente. Nenhuma alteração foi mantida.',
  );
}
