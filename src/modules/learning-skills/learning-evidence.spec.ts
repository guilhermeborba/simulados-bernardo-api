import { AttemptPracticeMode } from '@prisma/client';
import { aggregateEvidence, LearningEvidence } from './learning-evidence';
const base = new Date('2026-10-13T12:00:00Z');
function evidence(overrides: Partial<LearningEvidence> = {}): LearningEvidence {
  return {
    activityKey: 'math.quiz',
    originKey: 'q1',
    practiceMode: AttemptPracticeMode.NORMAL,
    isCorrect: false,
    confirmedAt: base,
    answerId: 'a1',
    skillCode: 'math.count',
    skillVersion: 1,
    skillTitle: 'Contagem',
    skillDisciplineSlug: 'matematica',
    skillSchoolYear: 3,
    ...overrides,
  };
}
const names = new Map([['matematica', 'Matemática']]);
describe('Learning evidence aggregation', () => {
  it('separates the earliest observation from normal repetition and review', () => {
    const rows = [
      evidence(),
      evidence({
        answerId: 'a2',
        isCorrect: true,
        confirmedAt: new Date(base.getTime() + 1000),
      }),
      evidence({
        answerId: 'a3',
        isCorrect: true,
        practiceMode: AttemptPracticeMode.REVIEW,
        confirmedAt: new Date(base.getTime() + 2000),
      }),
    ];
    const [skill] = aggregateEvidence(rows, 3, names).skills;
    expect(skill.firstResponse).toEqual({ questions: 1, correct: 0 });
    expect(skill.repeat).toEqual({ responses: 1, correct: 1 });
    expect(skill.review).toEqual({
      responses: 1,
      correct: 1,
      differentQuestions: 1,
    });
    expect(skill.distinctQuestions).toBe(1);
    expect(skill.evidence).toBe('INSUFFICIENT');
  });
  it('does not turn an unseen review question into first evidence in a later normal attempt', () => {
    const [skill] = aggregateEvidence(
      [
        evidence({ practiceMode: AttemptPracticeMode.REVIEW }),
        evidence({
          answerId: 'a2',
          isCorrect: true,
          confirmedAt: new Date(base.getTime() + 1000),
        }),
      ],
      3,
      names,
    ).skills;
    expect(skill.firstResponse.questions).toBe(0);
    expect(skill.repeat.responses).toBe(1);
    expect(skill.review.responses).toBe(1);
  });
  it('does not retroactively classify the first answer from an unclassified snapshot', () => {
    const result = aggregateEvidence(
      [
        evidence({
          skillCode: null,
          skillVersion: null,
          skillTitle: null,
          skillDisciplineSlug: null,
          skillSchoolYear: null,
        }),
        evidence({
          answerId: 'a2',
          confirmedAt: new Date(base.getTime() + 1000),
        }),
      ],
      3,
      names,
    );
    expect(result.unclassifiedQuestions).toBe(1);
    expect(result.skills[0].firstResponse.questions).toBe(0);
    expect(result.skills[0].repeat.responses).toBe(1);
  });
  it('keeps first identity stable across changes of skill version and classification', () => {
    const result = aggregateEvidence(
      [
        evidence(),
        evidence({
          answerId: 'a2',
          skillVersion: 2,
          skillTitle: 'Contagem revista',
          confirmedAt: new Date(base.getTime() + 1000),
        }),
      ],
      3,
      names,
    );
    expect(result.skills.map((row) => row.firstResponse.questions)).toEqual([
      1, 0,
    ]);
    expect(result.skills[1].repeat.responses).toBe(1);
  });
  it('uses logical activity and origin together rather than equating questions from different quizzes', () => {
    const [skill] = aggregateEvidence(
      [
        evidence(),
        evidence({
          activityKey: 'math.other',
          answerId: 'a2',
          isCorrect: true,
        }),
      ],
      3,
      names,
    ).skills;
    expect(skill.firstResponse).toEqual({ questions: 2, correct: 1 });
    expect(skill.distinctQuestions).toBe(2);
  });
  it('keeps repeated and review correctness from claiming sufficient first evidence', () => {
    const rows = Array.from({ length: 100 }, (_, i) =>
      evidence({
        answerId: `a${i}`,
        isCorrect: true,
        practiceMode:
          i % 2 ? AttemptPracticeMode.REVIEW : AttemptPracticeMode.NORMAL,
        confirmedAt: new Date(base.getTime() + i),
      }),
    );
    expect(aggregateEvidence(rows, 3, names).skills[0].evidence).toBe(
      'INSUFFICIENT',
    );
  });
  it('marks observations only after five distinct first questions without claiming mastery', () => {
    const rows = Array.from({ length: 5 }, (_, i) =>
      evidence({ originKey: `q${i}`, answerId: `a${i}` }),
    );
    const [skill] = aggregateEvidence(rows, 3, names).skills;
    expect(skill.evidence).toBe('OBSERVED');
    expect(skill.firstResponse.correct).toBe(0);
    expect(skill).not.toHaveProperty('mastery');
  });
  it('filters visible skill rows to the requested year but keeps the global unclassified count', () => {
    const rows = [
      evidence(),
      evidence({ originKey: 'q2', skillSchoolYear: 4 }),
      evidence({
        originKey: 'q3',
        skillCode: null,
        skillVersion: null,
        skillTitle: null,
        skillDisciplineSlug: null,
        skillSchoolYear: null,
      }),
    ];
    expect(
      aggregateEvidence(rows, 4, names).skills[0].firstResponse.questions,
    ).toBe(1);
    expect(aggregateEvidence(rows, null, names)).toEqual({
      skills: [],
      unclassifiedQuestions: 1,
    });
  });
  it('resolves simultaneous confirmation ties deterministically regardless of query input order', () => {
    const wrong = evidence({ answerId: 'a' }),
      correct = evidence({ answerId: 'b', isCorrect: true });
    expect(aggregateEvidence([correct, wrong], 3, names)).toEqual(
      aggregateEvidence([wrong, correct], 3, names),
    );
    expect(
      aggregateEvidence([correct, wrong], 3, names).skills[0].firstResponse
        .correct,
    ).toBe(0);
  });
});
