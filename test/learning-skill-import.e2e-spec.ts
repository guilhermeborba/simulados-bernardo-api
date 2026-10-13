import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  LearningSkillStatus,
  PrismaClient,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { LearningSkillsService } from '../src/modules/learning-skills/learning-skills.service';
import { CatalogQuiz, normalizeCatalogQuiz } from '../prisma/quiz-catalog';
import { importQuizCatalog } from '../prisma/quiz-catalog-import';
import { importSkillDrafts } from '../prisma/learning-skill-import';
import {
  SkillProposal,
  skillProposalHash,
} from '../prisma/learning-skill-catalog';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const baseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const authorEmail = 'learning-skill-import@example.test';
function quiz(index: number, turmaSlug: string | null = null): CatalogQuiz {
  return normalizeCatalogQuiz({
    activityKey: `skill-import-${index}`,
    contentVersion: 1,
    turmaSlug,
    disciplineSlug: 'matematica',
    schoolYear: 3,
    topic: 'Contagem',
    title: `Synthetic skill quiz ${index}`,
    review: { status: 'PENDING', reviewedBy: null, reviewedAt: null },
    questions: [
      {
        originKey: 'quantity.two',
        statement: 'Quanto é um mais um?',
        explanation: 'Uma unidade mais uma são duas.',
        points: 1,
        options: [
          { optionKey: 'A', text: 'Um' },
          { optionKey: 'B', text: 'Dois' },
        ],
        correctAnswer: 'B',
      },
    ],
  });
}
function proposal(source: CatalogQuiz, index: number): SkillProposal {
  return {
    code: `skill-import-${index}`,
    version: 1,
    title: `Contagem sintética ${index}`,
    description: 'Reconhecer a quantidade de unidades; somente fixture.',
    disciplineSlug: source.disciplineSlug,
    schoolYear: source.schoolYear,
    review: { status: 'PENDING', reviewedBy: null, reviewedAt: null },
    quiz: {
      activityKey: source.activityKey,
      contentVersion: source.contentVersion,
      contentHash: source.contentHash,
      questionOriginKeys: source.questions.map(
        (question) => question.originKey,
      ),
    },
  };
}
function approvedQuiz(source: CatalogQuiz): CatalogQuiz {
  return {
    ...source,
    review: {
      status: 'APPROVED',
      reviewedBy: 'Synthetic test reviewer',
      reviewedAt: '2026-10-01T12:00:00.000Z',
      contentHash: source.contentHash,
    },
  };
}

describe('Atomic draft skill import and independent publication gates', () => {
  let admin: PrismaClient,
    database: PrismaClient,
    schema: string,
    directory: string,
    adminId: string,
    disciplineId: string;
  let quizzes: CatalogQuiz[], skills: SkillProposal[];
  beforeAll(async () => {
    schema = `skills_import_${randomUUID().replaceAll('-', '')}`;
    directory = mkdtempSync(join(tmpdir(), 'skills-import-'));
    admin = new PrismaClient({ datasources: { db: { url: baseUrl } } });
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const url = new URL(baseUrl);
    url.searchParams.set('schema', schema);
    database = new PrismaClient({
      datasources: { db: { url: url.toString() } },
    });
    writeFileSync(
      join(directory, 'schema.prisma'),
      'datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\n}\n',
    );
    cpSync(resolve('prisma/migrations'), join(directory, 'migrations'), {
      recursive: true,
    });
    const result = spawnSync(
      process.execPath,
      [
        resolve('node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema',
        join(directory, 'schema.prisma'),
      ],
      {
        env: {
          ...process.env,
          DATABASE_URL: url.toString(),
          PRISMA_HIDE_UPDATE_MESSAGE: 'true',
          CHECKPOINT_DISABLE: '1',
        },
        encoding: 'utf8',
        timeout: 30000,
      },
    );
    expect(result.status).toBe(0);
  }, 60000);
  beforeEach(async () => {
    // The random schema was created by this suite; no existing application schema is touched.
    await database.$executeRawUnsafe(
      'TRUNCATE TABLE "User","Discipline","Turma","AuditLog" CASCADE',
    );
    adminId = (
      await database.user.create({
        data: {
          name: 'Synthetic import admin',
          email: authorEmail,
          passwordHash: 'synthetic',
          role: UserRole.ADMIN,
          status: 'ACTIVE',
        },
      })
    ).id;
    disciplineId = (
      await database.discipline.create({
        data: { name: 'Synthetic math', slug: 'matematica' },
      })
    ).id;
    quizzes = [quiz(1), quiz(2)];
    skills = quizzes.map((source, index) => proposal(source, index + 1));
  });
  afterAll(async () => {
    try {
      await database?.$disconnect();
    } finally {
      try {
        if (admin) {
          try {
            await admin.$executeRawUnsafe(
              `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
            );
          } finally {
            await admin.$disconnect();
          }
        }
      } finally {
        if (directory) rmSync(directory, { recursive: true, force: true });
      }
    }
  });
  async function importDraftQuizzes() {
    return importQuizCatalog(database, quizzes, { authorEmail });
  }
  async function savedQuiz(index = 1) {
    return database.simulation.findUniqueOrThrow({
      where: {
        activityKey_contentVersion: {
          activityKey: `skill-import-${index}`,
          contentVersion: 1,
        },
      },
      include: { questions: true },
    });
  }
  const run = () => importSkillDrafts(database, skills, authorEmail, quizzes);
  it('creates only pending drafts and classifications, then repeats idempotently without publishing content', async () => {
    await importDraftQuizzes();
    expect(await run()).toEqual({
      created: 2,
      unchanged: 0,
      classified: 2,
      published: 0,
    });
    expect(await run()).toEqual({
      created: 0,
      unchanged: 2,
      classified: 0,
      published: 0,
    });
    const rows = await database.learningSkill.findMany();
    expect(
      rows.every(
        (row) =>
          row.status === 'DRAFT' &&
          row.reviewedBy === null &&
          row.reviewedAt === null &&
          row.publishedAt === null,
      ),
    ).toBe(true);
    expect(await database.questionSkill.count()).toBe(2);
    expect(
      (await database.simulation.findMany()).every(
        (row) => row.status === 'DRAFT' && row.publishedAt === null,
      ),
    ).toBe(true);
    expect(await database.user.count()).toBe(1);
    expect(await database.discipline.count()).toBe(1);
  });
  it('does not infer runtime approval even from approved proposal metadata', async () => {
    await importDraftQuizzes();
    skills = skills.map((skill) => ({
      ...skill,
      review: {
        status: 'APPROVED',
        reviewedBy: 'Synthetic proposal reviewer',
        reviewedAt: '2026-10-01T12:00:00.000Z',
        contentHash: skillProposalHash(skill),
      },
    }));
    await run();
    expect(
      (await database.learningSkill.findMany()).every(
        (skill) =>
          skill.status === 'DRAFT' &&
          skill.reviewedAt === null &&
          skill.reviewedBy === null,
      ),
    ).toBe(true);
  });
  it('requires every referenced exact quiz draft before any classification is written', async () => {
    await importQuizCatalog(database, [quizzes[0]], { authorEmail });
    await expect(run()).rejects.toThrow(/rascunhos íntegros/);
    expect(await database.learningSkill.count()).toBe(0);
    expect(await database.questionSkill.count()).toBe(0);
    expect(await database.simulation.count()).toBe(1);
  });
  it('rejects stale source hashes before mutating drafts', async () => {
    await importDraftQuizzes();
    skills[1].quiz.contentHash = '0'.repeat(64);
    await expect(run()).rejects.toThrow(/hash/);
    expect(await database.learningSkill.count()).toBe(0);
    expect(await database.questionSkill.count()).toBe(0);
  });
  it('checks actual stored content rather than trusting an unchanged supplied hash', async () => {
    await importDraftQuizzes();
    const second = await savedQuiz(2);
    await database.question.update({
      where: { id: second.questions[0].id },
      data: { statement: 'Synthetic modified draft' },
    });
    await expect(run()).rejects.toThrow(/rascunhos íntegros/);
    expect(await database.learningSkill.count()).toBe(0);
    expect(await database.questionSkill.count()).toBe(0);
  });
  it.each(['public-to-private', 'private-to-another-group', 'deleted-group'])(
    'rejects changed publication scope before writing classifications: %s',
    async (scenario) => {
      const sourceGroup = await database.turma.create({
        data: {
          name: 'Synthetic source group',
          slug: 'synthetic-source-group',
          schoolYear: 3,
        },
      });
      const otherGroup = await database.turma.create({
        data: {
          name: 'Synthetic other group',
          slug: 'synthetic-other-group',
          schoolYear: 3,
        },
      });
      if (scenario !== 'public-to-private') {
        quizzes[1] = quiz(2, sourceGroup.slug);
        skills[1] = proposal(quizzes[1], 2);
      }
      await importDraftQuizzes();
      const second = await savedQuiz(2);
      if (scenario === 'deleted-group')
        await database.turma.update({
          where: { id: sourceGroup.id },
          data: { deletedAt: new Date() },
        });
      else
        await database.simulation.update({
          where: { id: second.id },
          data: { turmaId: otherGroup.id },
        });
      await expect(run()).rejects.toThrow(/rascunhos íntegros/);
      expect(await database.learningSkill.count()).toBe(0);
      expect(await database.questionSkill.count()).toBe(0);
    },
  );
  it('accepts the exact active group scope recorded in the source hash', async () => {
    const group = await database.turma.create({
      data: {
        name: 'Synthetic source group',
        slug: 'synthetic-source-group',
        schoolYear: 3,
      },
    });
    quizzes[1] = quiz(2, group.slug);
    skills[1] = proposal(quizzes[1], 2);
    await importDraftQuizzes();
    expect((await run()).classified).toBe(2);
    expect((await savedQuiz(2)).turmaId).toBe(group.id);
  });
  it.each([
    { role: UserRole.STUDENT },
    { status: 'BLOCKED' as const },
    { deletedAt: new Date('2026-10-01T12:00:00Z') },
  ])('requires an active ADMIN author %#', async (patch) => {
    await importDraftQuizzes();
    await database.user.update({ where: { id: adminId }, data: patch });
    await expect(run()).rejects.toThrow(/ADMIN ativo/);
    expect(await database.learningSkill.count()).toBe(0);
    expect(await database.questionSkill.count()).toBe(0);
  });
  it('rolls back the whole batch if a later question already has another classification', async () => {
    await importDraftQuizzes();
    const other = await database.learningSkill.create({
      data: {
        code: 'other.classification',
        title: 'Outra classificação',
        description: 'Synthetic conflict fixture',
        disciplineId,
        schoolYear: 3,
      },
    });
    const second = await savedQuiz(2);
    await database.questionSkill.create({
      data: { questionId: second.questions[0].id, skillId: other.id },
    });
    await expect(run()).rejects.toThrow(/outra classificação/);
    expect(await database.learningSkill.count()).toBe(1);
    expect(await database.questionSkill.count()).toBe(1);
    expect(
      await database.learningSkill.findFirst({
        where: { code: skills[0].code },
      }),
    ).toBeNull();
    expect(
      await database.learningSkill.findFirst({
        where: { code: skills[1].code },
      }),
    ).toBeNull();
  });
  it('keeps the complete batch as drafts until each linked skill has a real runtime review', async () => {
    await importDraftQuizzes();
    await run();
    const approved = quizzes.map(approvedQuiz);
    await expect(
      importQuizCatalog(database, approved, {
        authorEmail,
        publishReviewed: true,
      }),
    ).rejects.toThrow(/habilidades revisadas/);
    const learning = new LearningSkillsService(database as PrismaService);
    const rows = await database.learningSkill.findMany({
      orderBy: { code: 'asc' },
    });
    await learning.publish(rows[0].id, adminId, true);
    await expect(
      importQuizCatalog(database, approved, {
        authorEmail,
        publishReviewed: true,
      }),
    ).rejects.toThrow(/habilidades revisadas/);
    expect(
      (await database.simulation.findMany()).every(
        (row) => row.status === 'DRAFT',
      ),
    ).toBe(true);
    await learning.publish(rows[1].id, adminId, true);
    expect(
      await importQuizCatalog(database, approved, {
        authorEmail,
        publishReviewed: true,
      }),
    ).toEqual({ created: 0, unchanged: 2, published: 2 });
    expect(
      (await database.learningSkill.findMany()).every(
        (row) =>
          row.status === 'PUBLISHED' &&
          row.reviewedBy === adminId &&
          row.reviewedAt !== null,
      ),
    ).toBe(true);
    expect(
      await importQuizCatalog(database, approved, {
        authorEmail,
        publishReviewed: true,
      }),
    ).toEqual({ created: 0, unchanged: 2, published: 0 });
  });
  it('blocks archived skills from the quiz publication gate', async () => {
    await importDraftQuizzes();
    await run();
    const learning = new LearningSkillsService(database as PrismaService);
    for (const row of await database.learningSkill.findMany())
      await learning.publish(row.id, adminId, true);
    const row = await database.learningSkill.findFirstOrThrow();
    await learning.archive(row.id, adminId);
    await expect(
      importQuizCatalog(database, quizzes.map(approvedQuiz), {
        authorEmail,
        publishReviewed: true,
      }),
    ).rejects.toThrow(/habilidades revisadas/);
    expect(
      (await database.simulation.findMany()).every(
        (quiz) => quiz.status === SimulationStatus.DRAFT,
      ),
    ).toBe(true);
  });
  it('does not reclassify published quiz versions and preserves their existing mappings', async () => {
    await importDraftQuizzes();
    await run();
    const learning = new LearningSkillsService(database as PrismaService);
    for (const row of await database.learningSkill.findMany())
      await learning.publish(row.id, adminId, true);
    await importQuizCatalog(database, quizzes.map(approvedQuiz), {
      authorEmail,
      publishReviewed: true,
    });
    const before = await database.questionSkill.findMany({
      orderBy: { questionId: 'asc' },
    });
    await expect(run()).rejects.toThrow(/versões publicadas/);
    expect(
      await database.questionSkill.findMany({ orderBy: { questionId: 'asc' } }),
    ).toEqual(before);
    expect(
      await database.learningSkill.count({
        where: { status: LearningSkillStatus.PUBLISHED },
      }),
    ).toBe(2);
  });
});
