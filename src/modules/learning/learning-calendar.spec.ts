import { BadRequestException } from '@nestjs/common';
import { LearningSegment } from '@prisma/client';
import {
  learningDay,
  missionWeek,
  segmentForSchoolYear,
} from './learning-calendar';

describe('learning calendar', () => {
  it.each([
    ['2026-10-13T00:10:00.000Z', '2026-10-12'],
    ['2026-10-13T02:59:59.999Z', '2026-10-12'],
    ['2026-10-13T03:00:00.000Z', '2026-10-13'],
    ['2027-01-01T02:59:59.000Z', '2026-12-31'],
  ])('uses the Brazil day at %s', (instant, expected) => {
    expect(learningDay(new Date(instant))).toBe(expected);
  });

  it('opens and ends on consecutive Mondays at midnight in Sao Paulo', () => {
    expect(missionWeek('2026-10-12')).toEqual({
      startsAt: new Date('2026-10-12T03:00:00.000Z'),
      endsAt: new Date('2026-10-19T03:00:00.000Z'),
    });
  });

  it('resolves the IANA offset across the historical summer-time change', () => {
    expect(missionWeek('2018-10-29')).toEqual({
      startsAt: new Date('2018-10-29T03:00:00.000Z'),
      endsAt: new Date('2018-11-05T02:00:00.000Z'),
    });
  });

  it.each([
    '2026-10-13',
    '2026-02-30',
    '2026-13-01',
    '12/10/2026',
    '2026-1-12',
    '',
  ])('rejects an invalid Monday date %s', (value) => {
    expect(() => missionWeek(value)).toThrow(BadRequestException);
  });

  it.each([
    [-2, LearningSegment.INFANTIL],
    [-1, LearningSegment.INFANTIL],
    [0, LearningSegment.ENFERMAGEM],
    ...[1, 2, 3, 4, 5].map((year): [number, LearningSegment] => [
      year,
      LearningSegment.FUNDAMENTAL_I,
    ]),
    ...[6, 7, 8, 9].map((year): [number, LearningSegment] => [
      year,
      LearningSegment.FUNDAMENTAL_II,
    ]),
    ...[10, 11, 12].map((year): [number, LearningSegment] => [
      year,
      LearningSegment.MEDIO,
    ]),
  ])('maps schoolYear %s to %s', (year, expected) => {
    expect(segmentForSchoolYear(year as number)).toBe(expected);
  });

  it.each([-3, 13, 1.5, Number.NaN])(
    'rejects an unsupported schoolYear %s',
    (year) => {
      expect(() => segmentForSchoolYear(year)).toThrow(BadRequestException);
    },
  );
});
