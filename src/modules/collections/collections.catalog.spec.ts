import { CompletedQuizProgress, quizProgress } from './collections.catalog';

function completion(
  overrides: Partial<CompletedQuizProgress> = {},
): CompletedQuizProgress {
  return {
    attemptId: 'attempt-a',
    activityKey: 'logical-a',
    disciplineId: 'matematica',
    topic: 'Números',
    completedAt: new Date('2026-10-13T12:00:00Z'),
    recordedAt: new Date('2026-10-13T12:00:00Z'),
    ...overrides,
  };
}

describe('Cosmetic logical progress', () => {
  it('starts at zero without receipted quizzes', () => {
    expect(quizProgress([])).toEqual({ completedQuizzes: 0, topics: 0 });
  });

  it('uses the first receipted topic across content versions and repetitions', () => {
    expect(
      quizProgress([
        completion({
          attemptId: 'later',
          topic: 'Novo tema',
          completedAt: new Date('2026-10-14T12:00:00Z'),
        }),
        completion({ attemptId: 'first', topic: 'Números' }),
        completion({
          attemptId: 'repetition',
          topic: 'Outro tema',
          completedAt: new Date('2026-10-15T12:00:00Z'),
        }),
      ]),
    ).toEqual({ completedQuizzes: 1, topics: 1 });
  });

  it('uses receipt chronology when two finishes share a clock instant', () => {
    const first = completion({ attemptId: 'z-first', topic: 'Tema original' });
    const later = completion({
      attemptId: 'a-second',
      topic: 'Tema posterior',
      recordedAt: new Date('2026-10-13T12:00:01Z'),
    });
    const other = completion({
      activityKey: 'logical-b',
      topic: 'Tema original',
    });
    expect(quizProgress([later, first, other])).toEqual({
      completedQuizzes: 2,
      topics: 1,
    });
  });

  it('normalizes case and surrounding whitespace, without counting blank topics', () => {
    expect(
      quizProgress([
        completion({ topic: ' \nNÚMEROS\u00a0' }),
        completion({ activityKey: 'logical-b', topic: 'números' }),
        completion({ activityKey: 'logical-c', topic: '  \t' }),
        completion({ activityKey: 'logical-d', topic: null }),
      ]),
    ).toEqual({ completedQuizzes: 4, topics: 1 });
  });

  it('distinguishes equally named topics in different disciplines', () => {
    expect(
      quizProgress([
        completion({ topic: 'Medidas', disciplineId: 'matematica' }),
        completion({
          activityKey: 'logical-b',
          topic: 'Medidas',
          disciplineId: 'enfermagem',
        }),
      ]),
    ).toEqual({ completedQuizzes: 2, topics: 2 });
  });

  it('counts an earlier blank topic once without replacing it on a newer version', () => {
    expect(
      quizProgress([
        completion({ topic: null }),
        completion({
          attemptId: 'later',
          topic: 'Novo tema',
          recordedAt: new Date('2026-10-13T12:01:00Z'),
        }),
      ]),
    ).toEqual({ completedQuizzes: 1, topics: 0 });
  });
});
