import { BadRequestException } from '@nestjs/common';
import { Prisma, QuestionType } from '@prisma/client';
import {
  canonicalOfficialAnswers,
  correctAnswer,
  equivalentAnswer,
  normalizeSimulationAnswer,
  publicOptions,
  type SimulationSnapshot,
} from './simulation-feedback.contract';

function snapshot(
  type = QuestionType.MULTIPLE_CHOICE as QuestionType,
): SimulationSnapshot {
  const items =
    type === QuestionType.MATCHING
      ? [
          { optionKey: 'left:x', groupKey: 'left' },
          { optionKey: 'right:y', groupKey: 'right' },
          { optionKey: 'right:z', groupKey: 'right' },
        ]
      : type === QuestionType.MULTIPLE_CHOICE
        ? [
            { optionKey: 'A', groupKey: null },
            { optionKey: 'B', groupKey: null },
          ]
        : [
            { optionKey: 'x', groupKey: 'item' },
            { optionKey: 'y', groupKey: 'item' },
          ];
  return {
    questionId: 'q',
    type,
    statement: 'Synthetic',
    tip: 'A hint',
    funFact: 'A fact',
    explanation: '',
    theme: null,
    points: new Prisma.Decimal('0.1'),
    sortOrder: 1,
    options: items.map((item, index) => ({
      ...item,
      id: String(index),
      text: 'Synthetic option',
      order: index + 1,
    })),
    officialAnswers:
      type === QuestionType.MULTIPLE_CHOICE
        ? [{ answerKey: 'correctAnswer', answerValue: 'B' }]
        : type === QuestionType.MATCHING
          ? [{ answerKey: 'x', answerValue: 'y' }]
          : [
              {
                answerKey: 'x',
                answerValue: type === QuestionType.CLASSIFICATION ? 'C' : 'V',
              },
              {
                answerKey: 'y',
                answerValue: type === QuestionType.CLASSIFICATION ? 'P' : 'F',
              },
            ],
  };
}
describe('Simulation confirmation canonical contract', () => {
  it.each(['answer', 'value', 'optionKey', 'selectedOption'])(
    'normalizes the legacy %s alias for equivalent retries',
    (key) => {
      expect(normalizeSimulationAnswer(snapshot(), { [key]: ' b ' })).toEqual({
        answer: 'B',
      });
    },
  );
  it.each(Object.values(QuestionType))(
    'uses an explicit blank for %s',
    (type) => {
      expect(normalizeSimulationAnswer(snapshot(type), {})).toEqual({});
      expect(correctAnswer(snapshot(type))).not.toEqual({});
    },
  );
  it('requires complete true/false and classification maps, preserving case-insensitive correction', () => {
    expect(
      normalizeSimulationAnswer(snapshot(QuestionType.TRUE_FALSE_MULTIPLE), {
        answers: { y: 'f', x: ' v ' },
      }),
    ).toEqual({ x: 'V', y: 'F' });
    expect(
      normalizeSimulationAnswer(snapshot(QuestionType.CLASSIFICATION), {
        x: 'c',
        y: 'p',
      }),
    ).toEqual({ x: 'C', y: 'P' });
    expect(() =>
      normalizeSimulationAnswer(snapshot(QuestionType.TRUE_FALSE_MULTIPLE), {
        x: 'V',
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      normalizeSimulationAnswer(snapshot(QuestionType.CLASSIFICATION), {
        x: 'C',
        y: 'P',
        extra: 'C',
      }),
    ).toThrow(BadRequestException);
  });
  it.each([
    { x: true, y: false },
    { x: ' true ', y: 'FALSE' },
  ])(
    'canonicalizes legacy true/false answers and official maps: %p',
    (answer) => {
      const original = snapshot(QuestionType.TRUE_FALSE_MULTIPLE);
      const legacy = {
        ...original,
        officialAnswers: Object.entries(answer).map(
          ([answerKey, answerValue]) => ({
            answerKey,
            answerValue,
          }),
        ),
      };
      const canonical = { x: 'V', y: 'F' };
      expect(normalizeSimulationAnswer(legacy, answer)).toEqual(canonical);
      expect(correctAnswer(legacy)).toEqual(canonical);
      expect(canonicalOfficialAnswers(legacy)).toEqual([
        { answerKey: 'x', answerValue: 'V' },
        { answerKey: 'y', answerValue: 'F' },
      ]);
      expect(
        equivalentAnswer(normalizeSimulationAnswer(legacy, answer), canonical),
      ).toBe(true);
      expect(() => normalizeSimulationAnswer(legacy, { x: 1, y: 0 })).toThrow(
        BadRequestException,
      );
    },
  );
  it('strips matching prefixes only from item references, without exposing metadata', () => {
    const s = snapshot(QuestionType.MATCHING);
    expect(normalizeSimulationAnswer(s, { x: ' Y ' })).toEqual({ x: 'y' });
    expect(() => normalizeSimulationAnswer(s, { x: 'absent' })).toThrow(
      BadRequestException,
    );
    expect(
      publicOptions([
        {
          id: 'a',
          optionKey: 'A',
          text: 'A',
          groupKey: null,
          order: 1,
          metadata: { secret: true },
        },
      ]),
    ).toEqual([
      { id: 'a', optionKey: 'A', text: 'A', groupKey: null, order: 1 },
    ]);
  });
  it('does not accept incomplete, unknown, non-object or ambiguous answers', () => {
    for (const value of [
      null,
      [],
      { answer: 'C' },
      { answer: 'A', value: 'B' },
      { answers: [] },
      { answer: { key: 'B' } },
    ])
      expect(() => normalizeSimulationAnswer(snapshot(), value)).toThrow(
        BadRequestException,
      );
  });
  it('fails closed for empty or malformed official maps instead of awarding points', () => {
    for (const officialAnswers of [[], [{ answerKey: 'x', answerValue: 'V' }]])
      expect(() =>
        correctAnswer({
          ...snapshot(QuestionType.TRUE_FALSE_MULTIPLE),
          officialAnswers,
        }),
      ).toThrow(BadRequestException);
  });
  it('rejects ambiguous or blank option identifiers before starting a graded attempt', () => {
    const original = snapshot();
    const options = publicOptions(original.options).map((option) => ({ ...option }));
    for (const invalid of [
      [{ ...options[0], optionKey: ' ' }, options[1]],
      [options[0], { ...options[1], optionKey: ' a ' }],
      [options[0], { ...options[1], id: options[0].id }],
    ])
      expect(() => correctAnswer({ ...original, options: invalid })).toThrow(
        BadRequestException,
      );
  });
  it('compares canonical maps without depending on JSON property insertion order', () => {
    expect(equivalentAnswer({ x: 'V', y: 'F' }, { y: 'F', x: 'V' })).toBe(true);
    expect(equivalentAnswer({ x: 'V' }, { x: 'F' })).toBe(false);
    expect(equivalentAnswer({ x: 'V' }, { x: 'V', y: 'F' })).toBe(false);
  });
});
