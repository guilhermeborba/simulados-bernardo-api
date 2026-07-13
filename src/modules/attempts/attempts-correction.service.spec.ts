import { Prisma, QuestionType } from '@prisma/client';
import { AttemptsCorrectionService } from './attempts-correction.service';

describe('AttemptsCorrectionService', () => {
  let service: AttemptsCorrectionService;

  beforeEach(() => {
    service = new AttemptsCorrectionService();
  });

  it('corrects multiple choice answers', () => {
    expect(
      service.correct({
        type: QuestionType.MULTIPLE_CHOICE,
        points: new Prisma.Decimal(1),
        officialAnswers: [
          {
            id: 'answer-1',
            questionId: 'question-1',
            answerKey: 'correctAnswer',
            answerValue: 'B',
            metadata: null,
          },
        ],
        submittedAnswer: { answer: 'b' },
      }),
    ).toEqual({
      isCorrect: true,
      pointsEarned: 1,
    });
  });

  it('corrects true or false answer maps only when all items match', () => {
    expect(
      service.correct({
        type: QuestionType.TRUE_FALSE_MULTIPLE,
        points: new Prisma.Decimal(1),
        officialAnswers: [
          createAnswer('1', 'V'),
          createAnswer('2', 'F'),
          createAnswer('3', 'V'),
        ],
        submittedAnswer: {
          answers: {
            '1': 'V',
            '2': 'F',
            '3': 'V',
          },
        },
      }),
    ).toEqual({
      isCorrect: true,
      pointsEarned: 1,
    });

    expect(
      service.correct({
        type: QuestionType.TRUE_FALSE_MULTIPLE,
        points: new Prisma.Decimal(1),
        officialAnswers: [createAnswer('1', 'V'), createAnswer('2', 'F')],
        submittedAnswer: {
          '1': 'V',
          '2': 'V',
        },
      }),
    ).toEqual({
      isCorrect: false,
      pointsEarned: 0,
    });
  });

  it('corrects matching answer maps', () => {
    expect(
      service.correct({
        type: QuestionType.MATCHING,
        points: new Prisma.Decimal(2),
        officialAnswers: [createAnswer('casa', 'copo'), createAnswer('certo', 'cidade')],
        submittedAnswer: {
          casa: 'copo',
          certo: 'cidade',
        },
      }),
    ).toEqual({
      isCorrect: true,
      pointsEarned: 2,
    });
  });

  it('corrects classification answer maps', () => {
    expect(
      service.correct({
        type: QuestionType.CLASSIFICATION,
        points: new Prisma.Decimal(1.5),
        officialAnswers: [createAnswer('1', 'C'), createAnswer('2', 'P')],
        submittedAnswer: {
          '1': 'c',
          '2': 'p',
        },
      }),
    ).toEqual({
      isCorrect: true,
      pointsEarned: 1.5,
    });
  });

  function createAnswer(answerKey: string, answerValue: string) {
    return {
      id: `answer-${answerKey}`,
      questionId: 'question-1',
      answerKey,
      answerValue,
      metadata: null,
    };
  }
});
