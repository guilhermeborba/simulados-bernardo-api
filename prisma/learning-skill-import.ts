import { Prisma, PrismaClient, SimulationStatus } from '@prisma/client';
import { CatalogQuiz, readQuizCatalog } from './quiz-catalog';
import { quizMatchesCatalog } from './quiz-catalog-import';
import { QUIZ_PRIVATE_INCLUDE } from '../src/modules/quizzes/quizzes.presenter';
import {
  SkillCatalogError,
  SkillProposal,
  validateSkillCatalog,
} from './learning-skill-catalog';

/** Explicit, atomic draft-only import. No review or publication is inferred. */
export async function importSkillDrafts(
  prisma: PrismaClient,
  input: SkillProposal[],
  authorEmail: string,
  quizzes: CatalogQuiz[] = readQuizCatalog(),
) {
  const skills = validateSkillCatalog(input, quizzes).sort((a, b) =>
    a.code.localeCompare(b.code),
  );
  return prisma.$transaction(
    async (database) => {
      const keys = [
        ...new Set(skills.map((skill) => skill.quiz.activityKey)),
      ].sort();
      // Match quiz publishing/version locks before changing any classification.
      await database.$queryRaw(
        Prisma.sql`SELECT "id" FROM "Simulation" WHERE "activityKind"='QUIZ' AND "activityKey" IN (${Prisma.join(keys)}) ORDER BY "activityKey", "contentVersion", "id" FOR UPDATE`,
      );
      const author = await database.user.findFirst({
        where: {
          email: authorEmail,
          role: 'ADMIN',
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!author) throw new SkillCatalogError('Autor deve ser ADMIN ativo.');
      const plan = [];
      for (const skill of skills) {
        const quiz = await database.simulation.findFirst({
          where: {
            activityKind: 'QUIZ',
            activityKey: skill.quiz.activityKey,
            contentVersion: skill.quiz.contentVersion,
          },
          include: { ...QUIZ_PRIVATE_INCLUDE, discipline: true, turma: true },
        });
        const catalogQuiz = quizzes.find(
          (q) =>
            q.activityKey === skill.quiz.activityKey &&
            q.contentVersion === skill.quiz.contentVersion,
        )!;
        if (
          !quiz ||
          quiz.status !== SimulationStatus.DRAFT ||
          quiz.publishedAt ||
          quiz.deletedAt ||
          !quiz.discipline.isActive ||
          quiz.discipline.deletedAt ||
          quiz.discipline.slug !== skill.disciplineSlug ||
          (quiz.turma?.slug ?? null) !== catalogQuiz.turmaSlug ||
          (quiz.turmaId !== null &&
            (!quiz.turma || quiz.turma.deletedAt !== null)) ||
          !quizMatchesCatalog(quiz, catalogQuiz)
        )
          throw new SkillCatalogError(
            'Importe primeiro os quizzes como rascunhos íntegros; versões publicadas não podem ser reclassificadas.',
          );
        plan.push({ skill, quiz });
      }
      await database.$queryRaw(
        Prisma.sql`SELECT "id" FROM "LearningSkill" WHERE "code" IN (${Prisma.join(skills.map((s) => s.code))}) ORDER BY "id" FOR UPDATE`,
      );
      let created = 0,
        unchanged = 0,
        classified = 0;
      for (const { skill, quiz } of plan) {
        const prior = await database.learningSkill.findUnique({
          where: { code_version: { code: skill.code, version: skill.version } },
        });
        if (
          prior &&
          (prior.status !== 'DRAFT' ||
            prior.deletedAt ||
            prior.disciplineId !== quiz.disciplineId ||
            prior.schoolYear !== skill.schoolYear ||
            prior.title !== skill.title ||
            prior.description !== skill.description)
        )
          throw new SkillCatalogError(
            'Habilidade existente diverge da proposta ou já foi publicada; crie uma nova versão.',
          );
        const saved =
          prior ??
          (await database.learningSkill.create({
            data: {
              code: skill.code,
              version: skill.version,
              title: skill.title,
              description: skill.description,
              disciplineId: quiz.disciplineId,
              schoolYear: skill.schoolYear,
              status: 'DRAFT',
            },
          }));
        if (prior) unchanged++;
        else created++;
        for (const origin of skill.quiz.questionOriginKeys) {
          const question = quiz.questions.find((q) => q.originKey === origin)!;
          const mapping = await database.questionSkill.findUnique({
            where: { questionId: question.id },
          });
          if (mapping && mapping.skillId !== saved.id)
            throw new SkillCatalogError(
              'Pergunta já tem outra classificação; revise o rascunho explicitamente.',
            );
          if (!mapping) {
            await database.questionSkill.create({
              data: { questionId: question.id, skillId: saved.id },
            });
            classified++;
          }
        }
      }
      return { created, unchanged, classified, published: 0 };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 15_000,
      timeout: 60_000,
    },
  );
}
