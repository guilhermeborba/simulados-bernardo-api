import 'reflect-metadata';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Prisma, QuestionType } from '@prisma/client';
import { slugify } from '../src/common/utils/slugify';
import { CreateQuizDto } from '../src/modules/quizzes/dto/create-quiz.dto';
import { assertQuizContentReady } from '../src/modules/quizzes/quiz-content.validation';
import {
  normalizeQuizMedia,
  StoredQuizMedia,
} from '../src/modules/quizzes/media/quiz-media';

const DISCIPLINES = new Set([
  'portugues',
  'matematica',
  'ciencias',
  'historia',
  'geografia',
  'enfermagem',
  'infantil-eu-outro-nos',
  'infantil-corpo-gestos-movimentos',
  'infantil-tracos-sons-cores-formas',
  'infantil-escuta-fala-pensamento-imaginacao',
  'infantil-espacos-tempos-quantidades',
  'ingles',
  'arte',
  'educacao-fisica',
  'biologia',
  'fisica',
  'quimica',
  'filosofia',
  'sociologia',
]);
const ALL_YEARS = Array.from({ length: 15 }, (_, index) => index - 2);

export interface CatalogReview {
  status: 'PENDING' | 'APPROVED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  contentHash?: string;
}
export interface CatalogQuestion {
  originKey: string;
  statement: string;
  explanation: string;
  tip: string | null;
  funFact: string | null;
  points: number;
  options: { optionKey: string; text: string }[];
  correctAnswer: string;
  media: StoredQuizMedia | null;
}
export interface CatalogQuiz {
  activityKey: string;
  contentVersion: number;
  disciplineSlug: string;
  schoolYear: number;
  topic: string;
  title: string;
  subtitle: string | null;
  estimatedDurationMinutes: number | null;
  turmaSlug: string | null;
  sources: { title: string; url: string }[];
  questions: CatalogQuestion[];
  review: CatalogReview;
  contentHash: string;
}
export class QuizCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizCatalogError';
  }
}
function invalid(context: string): never {
  throw new QuizCatalogError(`Catálogo de quizzes inválido: ${context}.`);
}
function object(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    invalid(context);
  return value as Record<string, unknown>;
}
function keys(
  value: Record<string, unknown>,
  allowed: string[],
  context: string,
) {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    invalid(context);
}
function text(value: unknown, context: string, max: number): string {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    !value ||
    value.length > max
  )
    invalid(context);
  return value;
}
function optionalText(
  value: unknown,
  context: string,
  max: number,
): string | null {
  return value === undefined || value === null
    ? null
    : text(value, context, max);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
export function catalogContentHash(
  quiz: Omit<CatalogQuiz, 'review' | 'contentHash'>,
): string {
  return createHash('sha256').update(canonical(quiz)).digest('hex');
}

export function normalizeCatalogQuiz(input: unknown): CatalogQuiz {
  const quiz = object(input, 'quiz deve ser um objeto');
  keys(
    quiz,
    [
      'activityKey',
      'contentVersion',
      'disciplineSlug',
      'schoolYear',
      'topic',
      'title',
      'subtitle',
      'estimatedDurationMinutes',
      'turmaSlug',
      'sources',
      'review',
      'questions',
    ],
    'campos de quiz',
  );
  const activityKey = text(quiz.activityKey, 'activityKey', 120);
  const disciplineSlug = text(quiz.disciplineSlug, 'disciplineSlug', 120);
  if (!DISCIPLINES.has(disciplineSlug)) invalid('disciplina não cadastrada');
  if (
    !Number.isInteger(quiz.contentVersion) ||
    Number(quiz.contentVersion) < 1 ||
    Number(quiz.contentVersion) > 2147483647
  )
    invalid('contentVersion');
  if (
    !Number.isInteger(quiz.schoolYear) ||
    !ALL_YEARS.includes(Number(quiz.schoolYear))
  )
    invalid('schoolYear');
  const schoolYear = quiz.schoolYear as number;
  if (
    (schoolYear === 0 && disciplineSlug !== 'enfermagem') ||
    (schoolYear < 0 && !disciplineSlug.startsWith('infantil-')) ||
    (schoolYear > 0 &&
      (disciplineSlug === 'enfermagem' ||
        disciplineSlug.startsWith('infantil-')))
  )
    invalid('disciplina incompatível com público');
  if (
    !Array.isArray(quiz.questions) ||
    quiz.questions.length < 1 ||
    quiz.questions.length > 50
  )
    invalid('questões');
  const questions = quiz.questions.map((raw): CatalogQuestion => {
    const question = object(raw, 'questão deve ser um objeto');
    keys(
      question,
      [
        'originKey',
        'statement',
        'explanation',
        'tip',
        'funFact',
        'points',
        'options',
        'correctAnswer',
        'media',
      ],
      'campos de questão',
    );
    if (!Array.isArray(question.options)) invalid('alternativas');
    const options = question.options.map((rawOption) => {
      const option = object(rawOption, 'alternativa deve ser um objeto');
      keys(option, ['optionKey', 'text'], 'campos de alternativa');
      return {
        optionKey: text(option.optionKey, 'optionKey', 40),
        text: text(option.text, 'texto da alternativa', 1000),
      };
    });
    if (question.media !== undefined && question.media !== null) {
      const rawMedia = object(question.media, 'mídia');
      for (const kind of ['image', 'audio']) {
        if (rawMedia[kind] !== undefined) {
          const item = object(rawMedia[kind], 'item de mídia');
          text(
            item[kind === 'image' ? 'alt' : 'transcript'],
            'texto acessível de mídia',
            kind === 'image' ? 1000 : 5000,
          );
        }
      }
    }
    let media: StoredQuizMedia | null;
    try {
      media = normalizeQuizMedia(question.media);
    } catch {
      invalid('mídia não registrada ou inválida');
    }
    if (schoolYear < 0 && (!media?.image || !media?.audio))
      invalid('Educação Infantil requer imagem e áudio em todas as questões');
    return {
      originKey: text(question.originKey, 'originKey', 120),
      statement: text(question.statement, 'enunciado', 5000),
      explanation: text(question.explanation, 'explicação', 5000),
      tip: optionalText(question.tip, 'dica', 1000),
      funFact: optionalText(question.funFact, 'curiosidade', 1000),
      points: question.points as number,
      options,
      correctAnswer: text(question.correctAnswer, 'correctAnswer', 40),
      media,
    };
  });
  const dto = plainToInstance(CreateQuizDto, {
    activityKey,
    disciplineId: 'catalog-validation',
    schoolYear,
    topic: quiz.topic,
    title: quiz.title,
    subtitle: quiz.subtitle,
    estimatedDurationMinutes: quiz.estimatedDurationMinutes,
    questions: questions.map((question) => ({
      originKey: question.originKey,
      statement: question.statement,
      explanation: question.explanation,
      tip: question.tip,
      funFact: question.funFact,
      points: question.points,
      options: question.options,
      correctAnswer: question.correctAnswer,
    })),
  });
  if (validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).length)
    invalid('contrato de criação');
  try {
    assertQuizContentReady(
      questions.map((question, index) => ({
        ...question,
        type: QuestionType.MULTIPLE_CHOICE,
        points: new Prisma.Decimal(question.points),
        sortOrder: index + 1,
        options: question.options.map((option, optionIndex) => ({
          ...option,
          sortOrder: optionIndex + 1,
        })),
        answers: [
          { answerKey: 'correctAnswer', answerValue: question.correctAnswer },
        ],
        media: question.media as unknown as Prisma.JsonValue,
      })),
    );
  } catch {
    invalid('conteúdo de questões');
  }
  if (
    quiz.estimatedDurationMinutes !== undefined &&
    quiz.estimatedDurationMinutes !== null &&
    (typeof quiz.estimatedDurationMinutes !== 'number' ||
      !Number.isInteger(quiz.estimatedDurationMinutes))
  )
    invalid('duração');
  const sources = quiz.sources === undefined ? [] : quiz.sources;
  if (!Array.isArray(sources) || sources.length > 20) invalid('fontes');
  const normalizedSources = sources.map((raw) => {
    const source = object(raw, 'fonte');
    keys(source, ['title', 'url'], 'campos de fonte');
    const url = text(source.url, 'URL da fonte', 2048);
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password)
        invalid('URL da fonte');
    } catch {
      invalid('URL da fonte');
    }
    return { title: text(source.title, 'título da fonte', 240), url };
  });
  const review = object(quiz.review, 'revisão editorial obrigatória');
  keys(
    review,
    ['status', 'reviewedBy', 'reviewedAt', 'contentHash'],
    'campos de revisão',
  );
  if (review.status !== 'PENDING' && review.status !== 'APPROVED')
    invalid('status de revisão');
  if (
    review.status === 'PENDING' &&
    (review.reviewedBy !== null ||
      review.reviewedAt !== null ||
      review.contentHash !== undefined)
  )
    invalid('revisão pendente não deve simular aprovação');
  if (review.status === 'APPROVED') {
    text(review.reviewedBy, 'responsável pela revisão', 160);
    const reviewedAt = text(review.reviewedAt, 'data da revisão', 40);
    if (
      !/^\d{4}-\d{2}-\d{2}T/.test(reviewedAt) ||
      !Number.isFinite(Date.parse(reviewedAt)) ||
      new Date(reviewedAt).toISOString() !== reviewedAt ||
      Date.parse(reviewedAt) > Date.now()
    )
      invalid('data ISO de revisão');
    if (
      typeof review.contentHash !== 'string' ||
      !/^[a-f0-9]{64}$/.test(review.contentHash)
    )
      invalid('hash da revisão');
  }
  const content = {
    activityKey,
    contentVersion: quiz.contentVersion as number,
    disciplineSlug,
    schoolYear,
    topic: text(quiz.topic, 'tema', 160),
    title: text(quiz.title, 'título', 160),
    subtitle: optionalText(quiz.subtitle, 'subtítulo', 240),
    estimatedDurationMinutes:
      (quiz.estimatedDurationMinutes as number | undefined | null) ?? null,
    turmaSlug: optionalText(quiz.turmaSlug, 'turmaSlug', 120),
    sources: normalizedSources,
    questions,
  };
  if (
    content.turmaSlug &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(content.turmaSlug)
  )
    invalid('turmaSlug');
  const contentHash = catalogContentHash(content);
  if (review.status === 'APPROVED' && review.contentHash !== contentHash)
    invalid('aprovação desatualizada; revisar novamente o conteúdo');
  return {
    ...content,
    review: review as unknown as CatalogReview,
    contentHash,
  };
}

export function validateQuizCatalog(
  inputs: unknown[],
  requireInitialCoverage = false,
): CatalogQuiz[] {
  if (!Array.isArray(inputs) || !inputs.length) invalid('catálogo vazio');
  const quizzes = inputs.map(normalizeCatalogQuiz);
  const identities = new Set<string>();
  const slugs = new Set<string>();
  for (const quiz of quizzes) {
    const identity = `${quiz.activityKey}:${quiz.contentVersion}`;
    const slug = slugify(`quiz-${quiz.activityKey}-v${quiz.contentVersion}`);
    if (identities.has(identity) || slugs.has(slug))
      invalid('identidade ou slug de versão duplicado');
    identities.add(identity);
    slugs.add(slug);
  }
  if (
    requireInitialCoverage &&
    (quizzes.length !== 45 ||
      quizzes.reduce((count, quiz) => count + quiz.questions.length, 0) !==
        213 ||
      ALL_YEARS.some(
        (year) =>
          quizzes.filter((quiz) => quiz.schoolYear === year).length !== 3,
      ) ||
      quizzes.some(
        (quiz) => quiz.questions.length !== (quiz.schoolYear < 0 ? 3 : 5),
      ))
  )
    invalid(
      'catálogo inicial requer 45 quizzes, 213 questões e três quizzes por público',
    );
  return quizzes.sort(
    (a, b) =>
      a.activityKey.localeCompare(b.activityKey) ||
      a.contentVersion - b.contentVersion,
  );
}
export function readQuizCatalog(
  directory = resolve(__dirname, 'quiz-data'),
  requireInitialCoverage = true,
): CatalogQuiz[] {
  let inputs: unknown[] = [];
  try {
    const files = readdirSync(directory)
      .filter((name) => name.endsWith('.json'))
      .sort();
    for (const file of files) {
      const path = join(directory, file);
      if (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink())
        invalid('arquivo de catálogo');
      const entries: unknown = JSON.parse(readFileSync(path, 'utf8'));
      if (!Array.isArray(entries)) invalid('arquivo deve conter um array');
      inputs = inputs.concat(entries);
    }
  } catch (error) {
    if (error instanceof QuizCatalogError) throw error;
    invalid('não foi possível ler arquivos JSON');
  }
  return validateQuizCatalog(inputs, requireInitialCoverage);
}
export function quizCatalogInventory(quizzes: CatalogQuiz[]) {
  return {
    quizzes: quizzes.length,
    questions: quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0),
    pending: quizzes.filter((quiz) => quiz.review.status === 'PENDING').length,
    approved: quizzes.filter((quiz) => quiz.review.status === 'APPROVED')
      .length,
    coverage: ALL_YEARS.map((schoolYear) => ({
      schoolYear,
      quizzes: quizzes.filter((quiz) => quiz.schoolYear === schoolYear).length,
      questions: quizzes
        .filter((quiz) => quiz.schoolYear === schoolYear)
        .reduce((sum, quiz) => sum + quiz.questions.length, 0),
    })),
    entries: quizzes.map((quiz) => ({
      activityKey: quiz.activityKey,
      contentVersion: quiz.contentVersion,
      schoolYear: quiz.schoolYear,
      disciplineSlug: quiz.disciplineSlug,
      questions: quiz.questions.length,
      images: quiz.questions.filter((question) => question.media?.image).length,
      audios: quiz.questions.filter((question) => question.media?.audio).length,
      review: quiz.review.status,
      contentHash: quiz.contentHash,
    })),
  };
}
