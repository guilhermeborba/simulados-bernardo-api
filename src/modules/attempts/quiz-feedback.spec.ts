import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Prisma, QuestionType } from '@prisma/client';
import { AttemptsCorrectionService } from './attempts-correction.service';
import {
  normalizeQuizAnswer,
  parseSnapshotOfficialAnswers,
  publicQuizOptions,
  toPublicQuizFeedback,
} from './quiz-feedback';

const options = [
  { id: 'option-a', optionKey: 'A', text: 'Um', groupKey: null, order: 1 },
  { id: 'option-b', optionKey: 'B', text: 'Dois', groupKey: null, order: 2 },
];

const feedback = {
  isCorrect: true,
  pointsEarned: 1.25,
  explanation: 'A soma tem duas unidades.',
  funFact: 'Podemos contar usando os dedos.',
};

describe('quiz answer and feedback contracts', () => {
  it.each(['optionKey', 'selectedOption', 'answer', 'value'])(
    'normalizes the %s alias against the snapshot option',
    (key) => {
      expect(normalizeQuizAnswer({ [key]: ' b ' }, options)).toEqual({ optionKey: 'B' });
    },
  );

  it.each([
    null,
    'B',
    2,
    [],
    { optionKey: ['B'] },
    { optionKey: 2 },
    { optionKey: true },
    { optionKey: '' },
    { optionKey: '   ' },
    { optionKey: null },
    {},
    { unknown: 'B' },
    { answers: { optionKey: 'B' } },
    { optionKey: 'B', answer: 'B' },
    { optionKey: 'B', ignored: false },
    { optionKey: 'C' },
  ])('rejects ambiguous or invalid quiz input %#', (answer) => {
    expect(() => normalizeQuizAnswer(answer, options)).toThrow(BadRequestException);
  });

  it('adapts the private official snapshot to the existing correction service', () => {
    const officialAnswers = parseSnapshotOfficialAnswers(
      [{ answerKey: 'correctAnswer', answerValue: ' b ', metadata: 'private' }],
      options,
    );
    expect(officialAnswers).toEqual([{ answerKey: 'correctAnswer', answerValue: 'B' }]);
    const correction = new AttemptsCorrectionService();
    expect(
      correction.correct({
        type: QuestionType.MULTIPLE_CHOICE,
        points: new Prisma.Decimal(1.25),
        officialAnswers,
        submittedAnswer: normalizeQuizAnswer({ selectedOption: 'b' }, options),
      }),
    ).toEqual({ isCorrect: true, pointsEarned: 1.25 });
    expect(
      correction.correct({
        type: QuestionType.MULTIPLE_CHOICE,
        points: new Prisma.Decimal(1.25),
        officialAnswers,
        submittedAnswer: normalizeQuizAnswer({ value: 'A' }, options),
      }),
    ).toEqual({ isCorrect: false, pointsEarned: 0 });
  });

  it.each([
    null,
    {},
    [],
    [{ answerKey: 'correctAnswer', answerValue: 'A' }, { answerKey: 'x', answerValue: 'B' }],
    [{ answerKey: 'unexpected', answerValue: 'A' }],
    [{ answerKey: 'correctAnswer', answerValue: '' }],
    [{ answerKey: 'correctAnswer', answerValue: 1 }],
    [{ answerKey: 'correctAnswer', answerValue: 'C' }],
  ])('fails closed for malformed official answer %#', (value) => {
    expect(() => parseSnapshotOfficialAnswers(value, options)).toThrow(
      InternalServerErrorException,
    );
  });

  it('strips private fields from feedback and public options', () => {
    expect(
      toPublicQuizFeedback({
        ...feedback,
        officialAnswers: [{ answerValue: 'B' }],
        correctAnswer: 'B',
        media: { url: 'private' },
      }),
    ).toEqual(feedback);
    expect(
      publicQuizOptions(options.map((option) => ({ ...option, isCorrect: true, metadata: 'private' }))),
    ).toEqual(options);
  });

  it('keeps nullable feedback and funFact explicit', () => {
    expect(toPublicQuizFeedback(null)).toBeNull();
    expect(toPublicQuizFeedback({ ...feedback, funFact: null })).toEqual({
      ...feedback,
      funFact: null,
    });
  });

  it.each([
    [],
    {},
    { ...feedback, isCorrect: 'true' },
    { ...feedback, pointsEarned: '1.25' },
    { ...feedback, pointsEarned: -1 },
    { ...feedback, pointsEarned: Number.NaN },
    { ...feedback, pointsEarned: Number.POSITIVE_INFINITY },
    { ...feedback, pointsEarned: 10000 },
    { ...feedback, explanation: null },
    { ...feedback, explanation: '  ' },
    { ...feedback, funFact: { answer: 'B' } },
    { isCorrect: true, pointsEarned: 1, explanation: 'Bem feito.' },
  ])('fails closed for malformed saved feedback %#', (value) => {
    expect(() => toPublicQuizFeedback(value)).toThrow(InternalServerErrorException);
  });

  it.each([
    null,
    {},
    [],
    [options[0]],
    [{ ...options[0], groupKey: 1 }, options[1]],
    [{ ...options[0], id: '' }, options[1]],
    [{ ...options[0], text: '' }, options[1]],
    [{ ...options[0], order: 0 }, options[1]],
    [{ ...options[0], order: 1.5 }, options[1]],
    [options[0], { ...options[1], optionKey: ' a ' }],
    [options[0], { ...options[1], order: 1 }],
  ])('fails closed for malformed or ambiguous option snapshot %#', (value) => {
    expect(() => publicQuizOptions(value)).toThrow(InternalServerErrorException);
  });
});
