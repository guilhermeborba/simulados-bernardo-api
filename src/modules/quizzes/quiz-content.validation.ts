import { BadRequestException } from '@nestjs/common';
import { Prisma, QuestionType } from '@prisma/client';

export interface QuizContentQuestion {
  originKey: string | null;
  type: QuestionType;
  statement: string;
  explanation: string | null;
  media: Prisma.JsonValue | null;
  points: Prisma.Decimal;
  sortOrder: number;
  options: { optionKey: string; text: string; sortOrder: number }[];
  answers: { answerKey: string; answerValue: string }[];
}

// Used before publication and snapshot creation; never returns official content.
export function assertQuizContentReady(
  questions: QuizContentQuestion[],
): Prisma.Decimal {
  if (questions.length < 1 || questions.length > 50) {
    throw new BadRequestException(
      'Quiz must contain between 1 and 50 questions',
    );
  }

  const origins = new Set<string>();
  const orders = new Set<number>();
  let maxScore = new Prisma.Decimal(0);
  for (const question of questions) {
    if (
      question.type !== QuestionType.MULTIPLE_CHOICE ||
      !question.statement.trim() ||
      !question.explanation?.trim() ||
      !question.originKey ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(question.originKey) ||
      origins.has(question.originKey) ||
      !Number.isInteger(question.sortOrder) ||
      question.sortOrder < 1 ||
      orders.has(question.sortOrder)
    ) {
      throw new BadRequestException(
        'Quiz question content or origin key is invalid',
      );
    }
    if (question.media !== null) {
      throw new BadRequestException(
        'Quiz media requires an authorization policy',
      );
    }
    origins.add(question.originKey);
    orders.add(question.sortOrder);

    if (
      !question.points.isFinite() ||
      question.points.lessThanOrEqualTo(0) ||
      question.points.decimalPlaces() > 2
    ) {
      throw new BadRequestException(
        'Quiz question points must be positive with at most two decimals',
      );
    }
    const optionKeys = new Set<string>();
    if (question.options.length < 2 || question.options.length > 8) {
      throw new BadRequestException(
        'Quiz questions require between 2 and 8 options',
      );
    }
    for (const option of question.options) {
      const normalizedKey = option.optionKey.toLowerCase();
      if (
        !/^[A-Za-z0-9_-]+$/.test(option.optionKey) ||
        !option.text.trim() ||
        optionKeys.has(normalizedKey)
      ) {
        throw new BadRequestException(
          'Quiz option keys must be unique and nonempty',
        );
      }
      optionKeys.add(normalizedKey);
    }
    if (
      question.answers.length !== 1 ||
      question.answers[0].answerKey !== 'correctAnswer' ||
      !question.options.some(
        (option) => option.optionKey === question.answers[0].answerValue,
      )
    ) {
      throw new BadRequestException(
        'Quiz requires exactly one correct answer matching an option',
      );
    }
    maxScore = maxScore.plus(question.points);
  }
  if (maxScore.greaterThan('9999.99')) {
    throw new BadRequestException(
      'Quiz maximum score exceeds supported precision',
    );
  }
  return maxScore;
}
