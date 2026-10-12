import { BadRequestException } from '@nestjs/common';
import { Prisma, QuestionType } from '@prisma/client';
import {
  assertQuizContentReady,
  QuizContentQuestion,
} from './quiz-content.validation';

function question(): QuizContentQuestion {
  return {
    originKey: 'mat-1-contagem-q1',
    type: QuestionType.MULTIPLE_CHOICE,
    statement: 'Quanto é um mais um?',
    explanation: 'Ao acrescentar um a um, temos dois.',
    media: null,
    points: new Prisma.Decimal('1.25'),
    sortOrder: 1,
    options: [
      { optionKey: 'A', text: 'Um', sortOrder: 1 },
      { optionKey: 'B', text: 'Dois', sortOrder: 2 },
    ],
    answers: [{ answerKey: 'correctAnswer', answerValue: 'B' }],
  };
}

describe('Quiz content publication validation', () => {
  it('calculates decimal points without floating point drift', () => {
    const first = { ...question(), points: new Prisma.Decimal('0.1') };
    const second = {
      ...question(),
      originKey: 'mat-1-contagem-q2',
      sortOrder: 2,
      points: new Prisma.Decimal('0.2'),
    };
    expect(assertQuizContentReady([first, second]).toString()).toBe('0.3');
  });

  it.each([
    ['missing explanation', { explanation: null }],
    ['blank explanation', { explanation: '   ' }],
    ['missing origin', { originKey: null }],
    ['invalid origin', { originKey: ' a ' }],
    ['blank statement', { statement: ' ' }],
    ['unsupported question type', { type: QuestionType.MATCHING }],
    [
      'private media without policy',
      { media: { url: 'https://example.test/private.png' } },
    ],
    ['zero points', { points: new Prisma.Decimal(0) }],
    ['negative points', { points: new Prisma.Decimal(-1) }],
    ['excess precision', { points: new Prisma.Decimal('1.001') }],
    ['invalid order', { sortOrder: 0 }],
    ['missing answer', { answers: [] }],
    [
      'unmatched answer',
      { answers: [{ answerKey: 'correctAnswer', answerValue: 'C' }] },
    ],
    [
      'unexpected answer field',
      { answers: [{ answerKey: 'answers', answerValue: 'B' }] },
    ],
    ['one option', { options: [{ optionKey: 'A', text: 'Um', sortOrder: 1 }] }],
    [
      'ambiguous option case',
      {
        options: [
          { optionKey: 'A', text: 'Um', sortOrder: 1 },
          { optionKey: 'a', text: 'Dois', sortOrder: 2 },
        ],
      },
    ],
  ] satisfies [string, Partial<QuizContentQuestion>][])(
    'rejects %s',
    (_, patch) => {
      expect(() =>
        assertQuizContentReady([{ ...question(), ...patch }]),
      ).toThrow(BadRequestException);
    },
  );

  it('rejects duplicate logical questions across a version', () => {
    expect(() =>
      assertQuizContentReady([question(), { ...question(), sortOrder: 2 }]),
    ).toThrow(BadRequestException);
  });

  it('rejects duplicate sort orders', () => {
    expect(() =>
      assertQuizContentReady([question(), { ...question(), originKey: 'q2' }]),
    ).toThrow(BadRequestException);
  });

  it('rejects overflowing total score before database insertion', () => {
    expect(() =>
      assertQuizContentReady([
        { ...question(), points: new Prisma.Decimal('5000') },
        {
          ...question(),
          originKey: 'q2',
          sortOrder: 2,
          points: new Prisma.Decimal('5000'),
        },
      ]),
    ).toThrow(BadRequestException);
  });
});
