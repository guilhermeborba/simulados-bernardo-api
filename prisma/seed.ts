import { existsSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { Script, createContext } from 'node:vm';
import { hash } from 'bcryptjs';
import {
  Prisma,
  PrismaClient,
  QuestionType,
  SimulationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as ts from 'typescript';
import { slugify } from '../src/common/utils/slugify';

const prisma = new PrismaClient();

const frontendDataDir =
  process.env.FRONTEND_DATA_DIR ??
  resolve(process.cwd(), 'prisma/seed-data');

interface FrontendOption {
  id: string | number;
  text: string;
}

interface FrontendPair {
  left: FrontendOption;
  right: FrontendOption[];
}

interface FrontendQuestion {
  id: string | number;
  type:
    | 'multiple_choice'
    | 'true_false_multiple'
    | 'matching'
    | 'classification';
  text: string;
  options?: FrontendOption[];
  items?: FrontendOption[];
  pairs?: FrontendPair[];
  correctAnswer: string | Record<string, string>;
  tip?: string;
  points?: number;
}

interface DisciplineSeed {
  name: string;
  slug: string;
  description: string;
  icon: string;
  themeColor: string;
  hidden?: boolean;
}

interface SimulationSeed {
  file: string;
  exportName: string;
  disciplineSlug: string;
  schoolYear: number;
  bimester: number;
  assessment: string;
  title: string;
  subtitle: string;
  estimatedDurationMinutes: number;
  slug?: string;
}

interface NormalizedSimulationSeed
  extends Omit<SimulationSeed, 'file' | 'exportName'> {
  questions: FrontendQuestion[];
}

const disciplines: DisciplineSeed[] = [
  {
    name: 'Português',
    slug: 'portugues',
    description:
      'Fonética, gramática, ortografia, substantivos e verbos em questões interativas.',
    icon: '📖',
    themeColor: '#E54F94',
  },
  {
    name: 'Matemática',
    slug: 'matematica',
    description: 'Aritmética, geometria e lógica com problemas personalizados.',
    icon: '🧮',
    themeColor: '#4A95E5',
  },
  {
    name: 'Ciências',
    slug: 'ciencias',
    description: 'Seres vivos, corpo humano, meio ambiente e ecologia.',
    icon: '🔬',
    themeColor: '#2FB867',
  },
  {
    name: 'História',
    slug: 'historia',
    description: 'Fatos históricos, cultura, sociedade e convivência.',
    icon: '🏛️',
    themeColor: '#F5B91E',
  },
  {
    name: 'Geografia',
    slug: 'geografia',
    description: 'Mapas, regiões, paisagens e espaço geográfico.',
    icon: '🌎',
    themeColor: '#8B6DE0',
  },
  {
    name: 'Enfermagem',
    slug: 'enfermagem',
    description:
      'Fundamentos, ética e legislação do Curso Técnico em Enfermagem.',
    icon: '🩺',
    themeColor: '#2FB867',
    hidden: true,
  },
];

const simulations: SimulationSeed[] = [
  {
    file: 'questoes-matematica.ts',
    exportName: 'questoesMathematica',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-matematica-av1.ts',
    exportName: 'questoesMatematicaAv1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — Matemática',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-matematica-av2.ts',
    exportName: 'questoesMatematicaAv2',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — Matemática',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-matematica-3bim-av1.ts',
    exportName: 'questoesMatematica3BimAv1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — Matemática',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias.ts',
    exportName: 'questoesCiencias',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias-av1.ts',
    exportName: 'questoesCienciasAv1',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — Ciências',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias-av2.ts',
    exportName: 'questoesCienciasAv2',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — Ciências',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias-3bim-av1.ts',
    exportName: 'questoesCienciasAv1Bim3',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — Ciências',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia.ts',
    exportName: 'questoesHistoria',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia-av1.ts',
    exportName: 'questoesHistoriaAv1',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — História',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia-av2.ts',
    exportName: 'questoesHistoriaAv2',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — História',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia-3bim-av1.ts',
    exportName: 'questoesHistoriaAv1Bim3',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — História',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia.ts',
    exportName: 'questoesGeografia',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia-av1.ts',
    exportName: 'questoesGeografiaAv1',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — Geografia',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia-av2.ts',
    exportName: 'questoesGeografiaAv2',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — Geografia',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia-3bim-av1.ts',
    exportName: 'questoesGeografiaAv1Bim3',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — Geografia',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-enfermagem.ts',
    exportName: 'questoesEnfermagem',
    disciplineSlug: 'enfermagem',
    schoolYear: 0,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Fundamentos, Ética e Legislação em Enfermagem',
    subtitle: 'Curso Técnico em Enfermagem — 75 questões',
    estimatedDurationMinutes: 90,
    slug: 'enfermagem',
  },
];

async function main() {
  assertFrontendDataDir();

  const normalizedSimulations = loadSimulations();

  if (process.env.SEED_DRY_RUN === 'true') {
    const totalQuestions = normalizedSimulations.reduce(
      (total, simulation) => total + simulation.questions.length,
      0,
    );

    console.log(
      `Dry run concluído: ${disciplines.length} disciplinas, ${normalizedSimulations.length} simulados e ${totalQuestions} questões carregadas.`,
    );
    return;
  }

  const systemUser = await upsertSeedUser();
  const disciplineBySlug = await upsertDisciplines();

  for (const simulation of normalizedSimulations) {
    const discipline = disciplineBySlug.get(simulation.disciplineSlug);

    if (!discipline) {
      throw new Error(`Discipline not found: ${simulation.disciplineSlug}`);
    }

    const maxScore = getMaxScore(simulation.questions);
    const simulationSlug = simulation.slug ?? getSimulationSlug(simulation);
    const savedSimulation = await prisma.simulation.upsert({
      where: { slug: simulationSlug },
      create: {
        title: simulation.title,
        subtitle: simulation.subtitle,
        slug: simulationSlug,
        schoolYear: simulation.schoolYear,
        bimester: simulation.bimester,
        assessment: simulation.assessment,
        disciplineId: discipline.id,
        status: SimulationStatus.PUBLISHED,
        totalQuestions: simulation.questions.length,
        maxScore,
        estimatedDurationMinutes: simulation.estimatedDurationMinutes,
        createdById: systemUser.id,
        publishedAt: new Date(),
      },
      update: {
        title: simulation.title,
        subtitle: simulation.subtitle,
        schoolYear: simulation.schoolYear,
        bimester: simulation.bimester,
        assessment: simulation.assessment,
        disciplineId: discipline.id,
        status: SimulationStatus.PUBLISHED,
        totalQuestions: simulation.questions.length,
        maxScore,
        estimatedDurationMinutes: simulation.estimatedDurationMinutes,
        publishedAt: new Date(),
        deletedAt: null,
      },
    });

    await upsertQuestions(savedSimulation.id, simulation.questions);
  }

  const totalQuestions = normalizedSimulations.reduce(
    (total, simulation) => total + simulation.questions.length,
    0,
  );

  console.log(
    `Seed concluído: ${disciplines.length} disciplinas, ${normalizedSimulations.length} simulados e ${totalQuestions} questões importadas.`,
  );
}

function assertFrontendDataDir() {
  if (!existsSync(frontendDataDir)) {
    throw new Error(
      `Diretório de dados do front-end não encontrado: ${frontendDataDir}. Configure FRONTEND_DATA_DIR.`,
    );
  }
}

async function upsertSeedUser() {
  const email = 'seed-importer@simulados.local';

  return prisma.user.upsert({
    where: { email },
    create: {
      name: 'Seed Importer',
      email,
      passwordHash: await hash('seed-import-disabled-account', 4),
      role: UserRole.ADMIN,
      status: UserStatus.INACTIVE,
    },
    update: {
      name: 'Seed Importer',
      role: UserRole.ADMIN,
      status: UserStatus.INACTIVE,
      deletedAt: null,
    },
  });
}

async function upsertDisciplines() {
  const entries = await Promise.all(
    disciplines.map(async (discipline) => {
      const savedDiscipline = await prisma.discipline.upsert({
        where: { slug: discipline.slug },
        create: {
          name: discipline.name,
          slug: discipline.slug,
          description: discipline.description,
          icon: discipline.icon,
          themeColor: discipline.themeColor,
          isActive: !discipline.hidden,
        },
        update: {
          name: discipline.name,
          description: discipline.description,
          icon: discipline.icon,
          themeColor: discipline.themeColor,
          isActive: !discipline.hidden,
          deletedAt: null,
        },
      });

      return [discipline.slug, savedDiscipline] as const;
    }),
  );

  return new Map(entries);
}

function loadSimulations(): NormalizedSimulationSeed[] {
  const flatSimulations = simulations.map((simulation) => {
    const exports = loadDataModule(simulation.file);
    const questions = exports[simulation.exportName] as FrontendQuestion[];

    assertQuestions(simulation.file, questions);

    return {
      ...simulation,
      questions,
    };
  });

  const portugues = loadDataModule('questoes-portugues.ts')
    .questoesPortugues as Record<
    string,
    Record<string, Record<string, FrontendQuestion[]>>
  >;
  const portuguesSimulations = Object.entries(portugues.terceiro ?? {}).flatMap(
    ([bimester, assessments]) =>
      Object.entries(assessments).map(([assessment, questions]) => {
        assertQuestions(`questoes-portugues.ts ${bimester}-${assessment}`, questions);

        return {
          disciplineSlug: 'portugues',
          schoolYear: 3,
          bimester: Number(bimester),
          assessment,
          title: `Simulado de Português - ${bimester}º Bimestre ${assessment}`,
          subtitle: `${bimester}º Bimestre — 3º Ano`,
          estimatedDurationMinutes: 45,
          questions,
        };
      }),
  );

  return [...flatSimulations, ...portuguesSimulations].sort((a, b) =>
    getSimulationSlug(a).localeCompare(getSimulationSlug(b)),
  );
}

function loadDataModule(file: string): Record<string, unknown> {
  const filePath = join(frontendDataDir, file);
  const source = readFileSync(filePath, 'utf8').replace(/^import .+;$/gm, '');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: basename(filePath),
  });
  const exportsObject: Record<string, unknown> = {};
  const context = createContext({
    exports: exportsObject,
    module: { exports: exportsObject },
    require,
  });
  const script = new Script(transpiled.outputText, {
    filename: filePath,
  });

  script.runInContext(context);

  return exportsObject;
}

function assertQuestions(source: string, questions: unknown): asserts questions is FrontendQuestion[] {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error(`Nenhuma questão encontrada em ${source}`);
  }
}

function getSimulationSlug(
  simulation: Pick<
    NormalizedSimulationSeed,
    'disciplineSlug' | 'schoolYear' | 'bimester' | 'assessment'
  >,
) {
  return slugify(
    `${simulation.disciplineSlug}-${simulation.schoolYear}-ano-${simulation.bimester}-bimestre-${simulation.assessment}`,
  );
}

function getMaxScore(questions: FrontendQuestion[]) {
  return questions.reduce((total, question) => total + (question.points ?? 1), 0);
}

async function upsertQuestions(
  simulationId: string,
  questions: FrontendQuestion[],
) {
  const importedOrders = questions.map((question, index) =>
    getQuestionOrder(question, index),
  );

  for (const [index, question] of questions.entries()) {
    const sortOrder = getQuestionOrder(question, index);
    const savedQuestion = await prisma.question.upsert({
      where: {
        simulationId_sortOrder: {
          simulationId,
          sortOrder,
        },
      },
      create: {
        simulationId,
        type: mapQuestionType(question.type),
        statement: question.text,
        tip: question.tip,
        points: question.points ?? 1,
        sortOrder,
        isActive: true,
      },
      update: {
        type: mapQuestionType(question.type),
        statement: question.text,
        tip: question.tip,
        points: question.points ?? 1,
        isActive: true,
        deletedAt: null,
      },
    });

    await replaceQuestionOptions(savedQuestion.id, question);
    await replaceQuestionAnswers(savedQuestion.id, question);
  }

  await prisma.question.updateMany({
    where: {
      simulationId,
      sortOrder: {
        notIn: importedOrders,
      },
      deletedAt: null,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
}

function getQuestionOrder(question: FrontendQuestion, index: number) {
  const id = Number(question.id);
  return Number.isInteger(id) && id > 0 ? id : index + 1;
}

function mapQuestionType(type: FrontendQuestion['type']) {
  const typeMap: Record<FrontendQuestion['type'], QuestionType> = {
    multiple_choice: QuestionType.MULTIPLE_CHOICE,
    true_false_multiple: QuestionType.TRUE_FALSE_MULTIPLE,
    matching: QuestionType.MATCHING,
    classification: QuestionType.CLASSIFICATION,
  };

  return typeMap[type];
}

async function replaceQuestionOptions(
  questionId: string,
  question: FrontendQuestion,
) {
  await prisma.questionOption.deleteMany({
    where: { questionId },
  });

  const options = toQuestionOptions(question, questionId);

  if (options.length > 0) {
    await prisma.questionOption.createMany({
      data: options,
    });
  }
}

function toQuestionOptions(
  question: FrontendQuestion,
  questionId: string,
): Prisma.QuestionOptionCreateManyInput[] {
  if (question.type === 'multiple_choice') {
    return (question.options ?? []).map((option, index) => ({
      questionId,
      optionKey: String(option.id),
      text: option.text,
      sortOrder: index + 1,
      metadata: { frontendQuestionId: question.id },
    }));
  }

  if (
    question.type === 'true_false_multiple' ||
    question.type === 'classification'
  ) {
    return (question.items ?? []).map((item, index) => ({
      questionId,
      optionKey: String(item.id),
      text: item.text,
      groupKey: question.type === 'classification' ? 'item' : 'statement',
      sortOrder: index + 1,
      metadata: { frontendQuestionId: question.id },
    }));
  }

  const leftOptions = (question.pairs ?? []).map((pair, index) => ({
    questionId,
    optionKey: `left:${pair.left.id}`,
    text: pair.left.text,
    groupKey: 'left',
    sortOrder: index + 1,
    metadata: { frontendQuestionId: question.id },
  }));
  const rightOptionsById = new Map<string, FrontendOption>();

  for (const pair of question.pairs ?? []) {
    for (const right of pair.right) {
      rightOptionsById.set(String(right.id), right);
    }
  }

  const rightOptions = Array.from(rightOptionsById.values()).map(
    (right, index) => ({
      questionId,
      optionKey: `right:${right.id}`,
      text: right.text,
      groupKey: 'right',
      sortOrder: index + 1,
      metadata: { frontendQuestionId: question.id },
    }),
  );

  return [...leftOptions, ...rightOptions];
}

async function replaceQuestionAnswers(
  questionId: string,
  question: FrontendQuestion,
) {
  await prisma.questionAnswer.deleteMany({
    where: { questionId },
  });

  const answers = toQuestionAnswers(question, questionId);

  if (answers.length > 0) {
    await prisma.questionAnswer.createMany({
      data: answers,
    });
  }
}

function toQuestionAnswers(
  question: FrontendQuestion,
  questionId: string,
): Prisma.QuestionAnswerCreateManyInput[] {
  if (typeof question.correctAnswer === 'string') {
    return [
      {
        questionId,
        answerKey: 'correctAnswer',
        answerValue: question.correctAnswer,
        metadata: { frontendQuestionId: question.id },
      },
    ];
  }

  return Object.entries(question.correctAnswer).map(([answerKey, answerValue]) => ({
    questionId,
    answerKey,
    answerValue,
    metadata: { frontendQuestionId: question.id },
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
