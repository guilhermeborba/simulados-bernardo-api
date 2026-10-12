import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Prisma, QuestionAnswer } from '@prisma/client';

export interface QuizOption {
  id: string;
  optionKey: string;
  text: string;
  groupKey: string | null;
  order: number;
}

export interface QuizFeedback {
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string;
  funFact: string | null;
}

const answerKeys = new Set(['optionKey', 'selectedOption', 'answer', 'value']);

/** Resolve one scalar answer against the options of the attempt's snapshot. */
export function normalizeQuizAnswer(
  answer: unknown,
  options: Prisma.JsonValue,
): { optionKey: string } {
  if (!isRecord(answer)) {
    throw invalidAnswer();
  }
  const keys = Object.keys(answer);
  if (keys.length !== 1 || !answerKeys.has(keys[0])) {
    throw invalidAnswer();
  }
  const submittedValue = answer[keys[0]];
  if (!isNonemptyString(submittedValue)) {
    throw invalidAnswer();
  }
  const option = publicQuizOptions(options).find(
    (candidate) => normalized(candidate.optionKey) === normalized(submittedValue),
  );
  if (!option) {
    throw new BadRequestException('Quiz answer must reference a snapshot option');
  }
  return { optionKey: option.optionKey };
}

/** Private correction input. Never include this projection in a response. */
export function parseSnapshotOfficialAnswers(
  value: Prisma.JsonValue,
  options: Prisma.JsonValue,
): Array<Pick<QuestionAnswer, 'answerKey' | 'answerValue'>> {
  if (!Array.isArray(value) || value.length !== 1) {
    throw invalidSnapshot();
  }
  const officialAnswer = value[0];
  if (
    !isRecord(officialAnswer) ||
    officialAnswer.answerKey !== 'correctAnswer' ||
    !isNonemptyString(officialAnswer.answerValue)
  ) {
    throw invalidSnapshot();
  }
  const officialValue = officialAnswer.answerValue;
  const option = publicQuizOptions(options).find(
    (candidate) => normalized(candidate.optionKey) === normalized(officialValue),
  );
  if (!option) {
    throw invalidSnapshot();
  }
  return [{ answerKey: 'correctAnswer', answerValue: option.optionKey }];
}

/** Allowlist only. Raw feedback JSON may contain fields that are not public. */
export function toPublicQuizFeedback(value: Prisma.JsonValue | null): QuizFeedback | null {
  if (value === null) {
    return null;
  }
  if (
    !isRecord(value) ||
    typeof value.isCorrect !== 'boolean' ||
    typeof value.pointsEarned !== 'number' ||
    !Number.isFinite(value.pointsEarned) ||
    value.pointsEarned < 0 ||
    value.pointsEarned > 9999.99 ||
    !isNonemptyString(value.explanation) ||
    (value.funFact !== null && typeof value.funFact !== 'string')
  ) {
    throw new InternalServerErrorException('Saved quiz feedback is invalid');
  }
  return {
    isCorrect: value.isCorrect,
    pointsEarned: value.pointsEarned,
    explanation: value.explanation,
    funFact: value.funFact,
  };
}

/** Public option fields from private snapshot JSON, with no metadata spread. */
export function publicQuizOptions(value: Prisma.JsonValue): QuizOption[] {
  if (!Array.isArray(value) || value.length < 2) {
    throw invalidSnapshot();
  }
  const optionKeys = new Set<string>();
  const optionOrders = new Set<number>();
  return value.map((option) => {
    if (
      !isRecord(option) ||
      !isNonemptyString(option.id) ||
      !isNonemptyString(option.optionKey) ||
      !isNonemptyString(option.text) ||
      (option.groupKey !== null && typeof option.groupKey !== 'string') ||
      typeof option.order !== 'number' ||
      !Number.isSafeInteger(option.order) ||
      option.order < 1
    ) {
      throw invalidSnapshot();
    }
    const key = normalized(option.optionKey);
    if (optionKeys.has(key) || optionOrders.has(option.order)) {
      throw invalidSnapshot();
    }
    optionKeys.add(key);
    optionOrders.add(option.order);
    return {
      id: option.id,
      optionKey: option.optionKey,
      text: option.text,
      groupKey: option.groupKey,
      order: option.order,
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalized(value: string): string {
  return value.trim().toLowerCase();
}

function invalidAnswer(): BadRequestException {
  return new BadRequestException('Quiz answer must contain one string option');
}

function invalidSnapshot(): InternalServerErrorException {
  return new InternalServerErrorException('Quiz question snapshot is invalid');
}
