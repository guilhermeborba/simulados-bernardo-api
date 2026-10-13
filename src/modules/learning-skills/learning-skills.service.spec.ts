import {
  AttemptPracticeMode,
  LearningSkillStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LearningEvidence } from './learning-evidence';
import { LearningSkillsService } from './learning-skills.service';
const now = new Date('2026-10-13T12:00:00Z');
const service = new LearningSkillsService({} as PrismaService);
function evidence(overrides: Partial<LearningEvidence> = {}): LearningEvidence {
  return {
    activityKey: 'math.quiz',
    originKey: 'old-wrong',
    practiceMode: AttemptPracticeMode.NORMAL,
    isCorrect: false,
    confirmedAt: new Date(now.getTime() - 1000),
    answerId: 'a1',
    skillCode: 'math.count',
    skillVersion: 1,
    skillTitle: 'Contagem',
    skillDisciplineSlug: 'matematica',
    skillSchoolYear: 3,
    ...overrides,
  };
}
function quiz() {
  const skill = {
    id: 'skill1',
    code: 'math.count',
    version: 1,
    title: 'Contagem',
    schoolYear: 3,
    disciplineId: 'd1',
    status: LearningSkillStatus.PUBLISHED,
    deletedAt: null,
    publishedAt: now,
    reviewedAt: now,
    reviewedBy: 'admin',
    discipline: { slug: 'matematica', isActive: true, deletedAt: null },
  };
  return {
    id: 'quiz2',
    activityKey: 'math.quiz',
    schoolYear: 3,
    disciplineId: 'd1',
    questions: [
      'old-wrong',
      'old-correct',
      'new-1',
      'new-2',
      'new-3',
      'new-4',
      'new-5',
      'new-6',
    ].map((originKey, i) => ({
      id: `q${i}`,
      originKey,
      sortOrder: i + 1,
      points: new Prisma.Decimal(1),
      skill: { questionId: `q${i}`, skillId: 'skill1', skill },
    })),
  } as unknown as Parameters<LearningSkillsService['selectReviewQuestions']>[0];
}
describe('Learning review selection', () => {
  it('chooses at most five unseen origins before repeated difficulties', () => {
    const result = service.selectReviewQuestions(
      quiz(),
      [
        evidence(),
        evidence({ originKey: 'old-correct', answerId: 'a2', isCorrect: true }),
      ],
      now,
    );
    expect(result.map((row) => row.question.originKey)).toEqual([
      'new-1',
      'new-2',
      'new-3',
      'new-4',
      'new-5',
    ]);
    expect(result.every((row) => !row.practicedBefore)).toBe(true);
  });
  it('uses different repeated questions before returning the exact wrong question', () => {
    const q = quiz();
    q.questions = q.questions.slice(0, 2);
    const result = service.selectReviewQuestions(
      q,
      [
        evidence(),
        evidence({ originKey: 'old-correct', answerId: 'a2', isCorrect: true }),
      ],
      now,
    );
    expect(result.map((row) => row.question.originKey)).toEqual([
      'old-correct',
      'old-wrong',
    ]);
    expect(result.every((row) => row.practicedBefore)).toBe(true);
  });
  it('removes a difficulty resolved by a later review answer', () => {
    expect(
      service.selectReviewQuestions(
        quiz(),
        [
          evidence(),
          evidence({
            answerId: 'a2',
            isCorrect: true,
            practiceMode: AttemptPracticeMode.REVIEW,
            confirmedAt: now,
          }),
        ],
        now,
      ),
    ).toEqual([]);
  });
  it('ignores old and future confirmations instead of inventing recent difficulties', () => {
    expect(
      service.selectReviewQuestions(
        quiz(),
        [evidence({ confirmedAt: new Date(now.getTime() - 31 * 86400000) })],
        now,
      ),
    ).toEqual([]);
    expect(
      service.selectReviewQuestions(
        quiz(),
        [evidence({ confirmedAt: new Date(now.getTime() + 1) })],
        now,
      ),
    ).toEqual([]);
  });
  it('requires the exact reviewed skill version and audience in the authorized source quiz', () => {
    expect(
      service.selectReviewQuestions(
        quiz(),
        [evidence({ skillVersion: 2 })],
        now,
      ),
    ).toEqual([]);
    expect(
      service.selectReviewQuestions(
        quiz(),
        [evidence({ skillSchoolYear: 4 })],
        now,
      ),
    ).toEqual([]);
    const otherQuiz = service.selectReviewQuestions(
      quiz(),
      [evidence({ activityKey: 'other.quiz' })],
      now,
    );
    expect(otherQuiz).toHaveLength(5);
    expect(otherQuiz.every((row) => !row.practicedBefore)).toBe(true);
  });
  it('refuses draft, archived, deleted and unreviewed skill references', () => {
    for (const patch of [
      { status: LearningSkillStatus.DRAFT },
      { status: LearningSkillStatus.ARCHIVED },
      { deletedAt: now },
      { reviewedBy: null },
      { reviewedAt: null },
    ]) {
      const q = quiz();
      q.questions.forEach((row) => Object.assign(row.skill!.skill, patch));
      expect(service.selectReviewQuestions(q, [evidence()], now)).toEqual([]);
    }
  });
  it('pins only an active reviewed skill compatible with the source quiz into a new snapshot', () => {
    const source = quiz();
    const question = source.questions[0];
    expect(service.snapshotSkill(question, source)).toMatchObject({
      skillCode: 'math.count',
      skillVersion: 1,
      skillSchoolYear: 3,
    });
    expect(
      service.snapshotSkill(question, { ...source, schoolYear: 4 }),
    ).toEqual({});
    expect(
      service.snapshotSkill(question, { ...source, disciplineId: 'other' }),
    ).toEqual({});
    question.skill!.skill.status = LearningSkillStatus.ARCHIVED;
    expect(service.snapshotSkill(question, source)).toEqual({});
  });
});
