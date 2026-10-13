import { AttemptPracticeMode } from '@prisma/client';
export interface LearningEvidence {
  activityKey: string;
  originKey: string;
  practiceMode: AttemptPracticeMode;
  isCorrect: boolean;
  confirmedAt: Date;
  answerId: string;
  skillCode: string | null;
  skillVersion: number | null;
  skillTitle: string | null;
  skillDisciplineSlug: string | null;
  skillSchoolYear: number | null;
}
export interface LearningSkillProgress {
  code: string;
  version: number;
  title: string;
  discipline: { slug: string; name: string };
  schoolYear: number;
  firstResponse: { questions: number; correct: number };
  repeat: { responses: number; correct: number };
  review: { responses: number; correct: number; differentQuestions: number };
  distinctQuestions: number;
  evidence: 'INSUFFICIENT' | 'OBSERVED';
  lastPracticedAt: Date;
}
export const evidenceIdentity = (
  row: Pick<LearningEvidence, 'activityKey' | 'originKey'>,
) => JSON.stringify([row.activityKey, row.originKey]);
export const skillIdentity = (
  row: Pick<LearningEvidence, 'skillCode' | 'skillVersion'>,
) => JSON.stringify([row.skillCode, row.skillVersion]);
export function classified(row: LearningEvidence): boolean {
  return (
    row.skillCode !== null &&
    row.skillVersion !== null &&
    row.skillTitle !== null &&
    row.skillDisciplineSlug !== null &&
    row.skillSchoolYear !== null
  );
}
export function aggregateEvidence(
  evidence: LearningEvidence[],
  schoolYear: number | null,
  names: Map<string, string>,
) {
  const ordered = [...evidence].sort(
    (a, b) =>
      a.confirmedAt.getTime() - b.confirmedAt.getTime() ||
      (a.answerId < b.answerId ? -1 : a.answerId > b.answerId ? 1 : 0),
  );
  const seen = new Set<string>();
  const unclassified = new Set<string>();
  const rows = new Map<
    string,
    { progress: LearningSkillProgress; all: Set<string>; reviews: Set<string> }
  >();
  for (const row of ordered) {
    const questionKey = evidenceIdentity(row);
    const first =
      row.practiceMode === AttemptPracticeMode.NORMAL && !seen.has(questionKey);
    seen.add(questionKey);
    if (!classified(row)) {
      unclassified.add(questionKey);
      continue;
    }
    if (schoolYear === null || row.skillSchoolYear !== schoolYear) continue;
    const key = skillIdentity(row);
    let value = rows.get(key);
    if (!value) {
      value = {
        progress: {
          code: row.skillCode!,
          version: row.skillVersion!,
          title: row.skillTitle!,
          discipline: {
            slug: row.skillDisciplineSlug!,
            name:
              names.get(row.skillDisciplineSlug!) ?? row.skillDisciplineSlug!,
          },
          schoolYear: row.skillSchoolYear!,
          firstResponse: { questions: 0, correct: 0 },
          repeat: { responses: 0, correct: 0 },
          review: { responses: 0, correct: 0, differentQuestions: 0 },
          distinctQuestions: 0,
          evidence: 'INSUFFICIENT',
          lastPracticedAt: row.confirmedAt,
        },
        all: new Set(),
        reviews: new Set(),
      };
      rows.set(key, value);
    }
    value.all.add(questionKey);
    value.progress.lastPracticedAt = row.confirmedAt;
    if (row.practiceMode === AttemptPracticeMode.REVIEW) {
      value.progress.review.responses++;
      if (row.isCorrect) value.progress.review.correct++;
      value.reviews.add(questionKey);
    } else if (first) {
      value.progress.firstResponse.questions++;
      if (row.isCorrect) value.progress.firstResponse.correct++;
    } else {
      value.progress.repeat.responses++;
      if (row.isCorrect) value.progress.repeat.correct++;
    }
  }
  const skills = [...rows.values()]
    .map(({ progress, all, reviews }) => ({
      ...progress,
      distinctQuestions: all.size,
      review: { ...progress.review, differentQuestions: reviews.size },
      evidence:
        progress.firstResponse.questions >= 5
          ? ('OBSERVED' as const)
          : ('INSUFFICIENT' as const),
    }))
    .sort(
      (a, b) =>
        a.discipline.slug.localeCompare(b.discipline.slug) ||
        a.code.localeCompare(b.code) ||
        a.version - b.version,
    );
  return { skills, unclassifiedQuestions: unclassified.size };
}
