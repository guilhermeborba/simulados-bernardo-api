import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CatalogQuiz, readQuizCatalog } from './quiz-catalog';

export interface SkillProposal {
  code: string;
  version: number;
  title: string;
  description: string;
  disciplineSlug: string;
  schoolYear: number;
  review: {
    status: 'PENDING' | 'APPROVED';
    reviewedBy: string | null;
    reviewedAt: string | null;
    contentHash?: string;
  };
  quiz: {
    activityKey: string;
    contentVersion: number;
    contentHash: string;
    questionOriginKeys: string[];
  };
}
export class SkillCatalogError extends Error {}
const invalid = (message: string): never => {
  throw new SkillCatalogError(`Catálogo de habilidades inválido: ${message}.`);
};
function record(value: unknown, allowed: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return invalid('objeto esperado');
  const object = value as Record<string, unknown>;
  if (Object.keys(object).some((key) => !allowed.includes(key)))
    invalid('campo desconhecido');
  return object;
}
function text(value: unknown, max = 200): string {
  if (
    typeof value !== 'string' ||
    !value ||
    value.trim() !== value ||
    value.length > max
  )
    return invalid('texto');
  return value;
}
export function skillProposalHash(skill: SkillProposal): string {
  const { review: _review, ...content } = skill;
  void _review;
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
export function validateSkillCatalog(
  input: unknown,
  quizzes: CatalogQuiz[] = readQuizCatalog(),
): SkillProposal[] {
  if (!Array.isArray(input)) return invalid('array esperado');
  const identities = new Set<string>();
  const mapped = new Set<string>();
  const sources = new Map(
    quizzes.map((q) => [`${q.activityKey}:${q.contentVersion}`, q]),
  );
  const skills = input.map((value) => {
    const s = record(value, [
      'code',
      'version',
      'title',
      'description',
      'disciplineSlug',
      'schoolYear',
      'review',
      'quiz',
    ]);
    const code = text(s.code, 120);
    if (!/^[a-z0-9][a-z0-9._:-]*$/.test(code) || s.version !== 1)
      invalid('código interno ou versão inicial');
    const title = text(s.title);
    const description = text(s.description, 2000);
    const disciplineSlug = text(s.disciplineSlug, 120);
    const review = record(s.review, [
      'status',
      'reviewedBy',
      'reviewedAt',
      'contentHash',
    ]);
    const mapping = record(s.quiz, [
      'activityKey',
      'contentVersion',
      'contentHash',
      'questionOriginKeys',
    ]);
    const quiz = sources.get(
      `${mapping.activityKey}:${mapping.contentVersion}`,
    );
    if (
      !quiz ||
      quiz.disciplineSlug !== disciplineSlug ||
      quiz.schoolYear !== s.schoolYear ||
      quiz.contentHash !== mapping.contentHash
    )
      invalid('origem, faixa, disciplina ou hash do quiz');
    const origins = mapping.questionOriginKeys;
    if (!Array.isArray(origins) || origins.length === 0)
      invalid('classificação vazia');
    for (const origin of origins as unknown[]) {
      if (
        typeof origin !== 'string' ||
        !quiz!.questions.some((question) => question.originKey === origin)
      )
        invalid('pergunta inexistente');
      const key = `${quiz!.activityKey}:${quiz!.contentVersion}:${origin}`;
      if (mapped.has(key)) invalid('pergunta classificada mais de uma vez');
      mapped.add(key);
    }
    const identity = `${code}:${s.version}`;
    if (identities.has(identity)) invalid('habilidade duplicada');
    identities.add(identity);
    const skill = {
      code,
      version: 1,
      title,
      description,
      disciplineSlug,
      schoolYear: quiz!.schoolYear,
      review,
      quiz: {
        activityKey: quiz!.activityKey,
        contentVersion: quiz!.contentVersion,
        contentHash: quiz!.contentHash,
        questionOriginKeys: origins,
      },
    } as SkillProposal;
    if (review.status === 'PENDING') {
      if (
        review.reviewedBy !== null ||
        review.reviewedAt !== null ||
        review.contentHash !== undefined
      )
        invalid('pendência com aprovação presumida');
    } else if (review.status === 'APPROVED') {
      text(review.reviewedBy, 200);
      text(review.reviewedAt, 80);
      if (
        !Number.isFinite(Date.parse(review.reviewedAt as string)) ||
        review.contentHash !== skillProposalHash(skill)
      )
        invalid('aprovação sem data/hash atual');
    } else invalid('status editorial');
    return skill;
  });
  if (mapped.size !== quizzes.reduce((sum, q) => sum + q.questions.length, 0))
    invalid('cobertura incompleta de perguntas');
  return skills;
}
export function readSkillCatalog(): SkillProposal[] {
  try {
    return validateSkillCatalog(
      JSON.parse(
        readFileSync(resolve(__dirname, 'learning-skill-data.json'), 'utf8'),
      ),
    );
  } catch (error) {
    if (error instanceof SkillCatalogError) throw error;
    return invalid('leitura do arquivo');
  }
}
export function skillCatalogInventory(skills = readSkillCatalog()) {
  return {
    skills: skills.length,
    classifiedQuestions: skills.reduce(
      (sum, s) => sum + s.quiz.questionOriginKeys.length,
      0,
    ),
    pending: skills.filter((s) => s.review.status === 'PENDING').length,
    approved: skills.filter((s) => s.review.status === 'APPROVED').length,
    coverage: [...new Set(skills.map((s) => s.schoolYear))]
      .sort((a, b) => a - b)
      .map((schoolYear) => ({
        schoolYear,
        skills: skills.filter((s) => s.schoolYear === schoolYear).length,
        questions: skills
          .filter((s) => s.schoolYear === schoolYear)
          .reduce((sum, s) => sum + s.quiz.questionOriginKeys.length, 0),
      })),
    proposals: skills.map((s) => ({
      ...s,
      definitionHash: skillProposalHash(s),
    })),
  };
}
