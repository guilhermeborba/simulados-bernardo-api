import { BadRequestException } from '@nestjs/common';
import { Prisma, QuestionType } from '@prisma/client';

type RecordValue = Record<string, unknown>;
export interface PublicOption {
  id: string;
  optionKey: string;
  text: string;
  groupKey: string | null;
  order: number;
}
interface OfficialAnswer {
  answerKey: string;
  answerValue: string;
}
export interface SimulationSnapshot {
  questionId: string;
  type: QuestionType;
  statement: string;
  tip: string | null;
  funFact: string | null;
  explanation: string;
  theme: string | null;
  points: Prisma.Decimal;
  sortOrder: number;
  options: Prisma.JsonValue;
  officialAnswers: Prisma.JsonValue;
}
const record = (value: unknown): value is RecordValue =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
const normalized = (value: string) => value.trim().toLowerCase();

export function publicOptions(value: Prisma.JsonValue): PublicOption[] {
  if (!Array.isArray(value) || value.length === 0)
    throw new BadRequestException('Question options are invalid');
  const options = value.map((entry) => {
    if (
      !record(entry) ||
      typeof entry.id !== 'string' ||
      !entry.id.trim() ||
      typeof entry.optionKey !== 'string' ||
      !entry.optionKey.trim() ||
      typeof entry.text !== 'string' ||
      typeof entry.order !== 'number' ||
      !Number.isFinite(entry.order) ||
      !(entry.groupKey === null || typeof entry.groupKey === 'string')
    )
      throw new BadRequestException('Question options are invalid');
    return {
      id: entry.id,
      optionKey: entry.optionKey,
      text: entry.text,
      groupKey: entry.groupKey,
      order: entry.order,
    };
  });
  if (
    new Set(options.map((option) => normalized(option.optionKey))).size !==
      options.length ||
    new Set(options.map((option) => option.id)).size !== options.length
  )
    throw new BadRequestException('Question options are ambiguous');
  return options;
}
export function officialAnswers(
  value: Prisma.JsonValue,
  type?: QuestionType,
): OfficialAnswer[] {
  if (!Array.isArray(value) || value.length === 0)
    throw new BadRequestException('Question correction is unavailable');
  return value.map((entry) => {
    if (
      !record(entry) ||
      typeof entry.answerKey !== 'string' ||
      !(
        typeof entry.answerValue === 'string' ||
        (type === QuestionType.TRUE_FALSE_MULTIPLE &&
          typeof entry.answerValue === 'boolean')
      )
    )
      throw new BadRequestException('Question correction is invalid');
    return {
      answerKey: entry.answerKey,
      answerValue: String(entry.answerValue),
    };
  });
}

export type ClassificationMode = 'CP' | 'TEXT';

/** The mode is public; the private values used to derive it remain server-only. */
export function classificationMode(
  type: QuestionType,
  answers: ReadonlyArray<{ answerValue: string }>,
): ClassificationMode | undefined {
  if (type !== QuestionType.CLASSIFICATION) return undefined;
  return answers.length > 0 &&
    answers.every((answer) =>
      ['C', 'P'].includes(answer.answerValue.trim().toUpperCase()),
    )
    ? 'CP'
    : 'TEXT';
}

export function snapshotClassificationMode(
  snapshot: SimulationSnapshot,
): ClassificationMode | undefined {
  if (snapshot.type !== QuestionType.CLASSIFICATION) return undefined;
  return classificationMode(
    snapshot.type,
    officialAnswers(snapshot.officialAnswers),
  );
}

/** Canonical forms are identical to the existing simulation correction bodies.
 * Blank is {}. Only a complete selection or an explicit blank is confirmable. */
export function normalizeSimulationAnswer(
  snapshot: SimulationSnapshot,
  value: unknown,
): Record<string, string> {
  if (!record(value)) throw new BadRequestException('Answer must be an object');
  if (Object.keys(value).length === 0) return {};
  const options = publicOptions(snapshot.options);
  if (snapshot.type === QuestionType.MULTIPLE_CHOICE) {
    const keys = Object.keys(value);
    if (
      keys.length !== 1 ||
      !['answer', 'value', 'optionKey', 'selectedOption'].includes(keys[0]) ||
      !['string', 'number'].includes(typeof value[keys[0]])
    )
      throw new BadRequestException('Choose one answer');
    const option = options.find(
      (entry) =>
        normalized(entry.optionKey) === normalized(String(value[keys[0]])),
    );
    if (!option) throw new BadRequestException('Unknown answer option');
    return { answer: option.optionKey };
  }
  const selected =
    record(value.answers) && Object.keys(value).length === 1
      ? value.answers
      : value;
  const items =
    snapshot.type === QuestionType.MATCHING
      ? options
          .filter((entry) => entry.groupKey === 'left')
          .map((entry) => entry.optionKey.replace(/^left:/, ''))
      : options.map((entry) => entry.optionKey);
  if (
    !items.length ||
    Object.keys(selected).length !== items.length ||
    items.some((id) => !Object.prototype.hasOwnProperty.call(selected, id))
  )
    throw new BadRequestException(
      'Answer every item or leave the question blank',
    );
  const textClassification = snapshotClassificationMode(snapshot) === 'TEXT';
  return Object.fromEntries(
    items.sort().map((id) => {
      const raw = selected[id];
      if (textClassification) {
        if (typeof raw !== 'string' || !raw.trim() || raw.length > 2000)
          throw new BadRequestException(
            'Text answers must contain 1 to 2000 characters',
          );
        return [id, raw.trim()];
      }
      if (!['string', 'number', 'boolean'].includes(typeof raw))
        throw new BadRequestException('Invalid answer value');
      const value = String(raw).trim();
      if (snapshot.type === QuestionType.MATCHING) {
        const option = options
          .filter((entry) => entry.groupKey === 'right')
          .find(
            (entry) =>
              normalized(entry.optionKey.replace(/^right:/, '')) ===
              normalized(value),
          );
        if (!option) throw new BadRequestException('Unknown matching option');
        return [id, option.optionKey.replace(/^right:/, '')];
      }
      const canonical =
        snapshot.type === QuestionType.TRUE_FALSE_MULTIPLE
          ? value.toUpperCase() === 'TRUE'
            ? 'V'
            : value.toUpperCase() === 'FALSE'
              ? 'F'
              : value.toUpperCase()
          : value.toUpperCase();
      const allowed =
        snapshot.type === QuestionType.TRUE_FALSE_MULTIPLE
          ? ['V', 'F']
          : ['C', 'P'];
      if (!allowed.includes(canonical))
        throw new BadRequestException('Unknown answer value');
      return [id, canonical];
    }),
  );
}

/** Called only inside an authenticated, confirmed-answer/result projection. */
export function correctAnswer(
  snapshot: SimulationSnapshot,
): Record<string, string> {
  const answers = officialAnswers(snapshot.officialAnswers, snapshot.type);
  if (new Set(answers.map((entry) => entry.answerKey)).size !== answers.length)
    throw new BadRequestException('Question correction is invalid');
  const answer =
    snapshot.type === QuestionType.MULTIPLE_CHOICE
      ? answers.length === 1 && answers[0].answerKey === 'correctAnswer'
        ? { answer: answers[0].answerValue }
        : null
      : Object.fromEntries(
          answers.map((entry) => [entry.answerKey, entry.answerValue]),
        );
  if (!answer) throw new BadRequestException('Question correction is invalid');
  return normalizeSimulationAnswer(snapshot, answer);
}
/** Keep the existing correction engine on the same canonical form as retries. */
export function canonicalOfficialAnswers(
  snapshot: SimulationSnapshot,
): OfficialAnswer[] {
  return Object.entries(correctAnswer(snapshot)).map(
    ([answerKey, answerValue]) => ({
      answerKey:
        snapshot.type === QuestionType.MULTIPLE_CHOICE
          ? 'correctAnswer'
          : answerKey,
      answerValue,
    }),
  );
}
export function equivalentAnswer(
  a: Record<string, string>,
  b: Record<string, string>,
  mode?: ClassificationMode,
): boolean {
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(([key, value]) =>
      mode === 'TEXT'
        ? typeof b[key] === 'string' && normalized(b[key]) === normalized(value)
        : b[key] === value,
    )
  );
}
