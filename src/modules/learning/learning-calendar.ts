import { BadRequestException } from '@nestjs/common';
import { LearningSegment } from '@prisma/client';

export const XP_PER_QUIZ = 10;
export const XP_DAILY_LIMIT = 50;
export const LEARNING_TIME_ZONE = 'America/Sao_Paulo';
export const SCHOOL_YEARS = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: LEARNING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function learningDay(instant: Date): string {
  const parts = dayFormatter.formatToParts(instant);
  const value = (type: string) =>
    parts.find((part) => part.type === type)!.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function segmentForSchoolYear(year: number): LearningSegment {
  if (!SCHOOL_YEARS.includes(year))
    throw new BadRequestException('Invalid schoolYear');
  if (year < 0) return LearningSegment.INFANTIL;
  if (year === 0) return LearningSegment.ENFERMAGEM;
  if (year <= 5) return LearningSegment.FUNDAMENTAL_I;
  if (year <= 9) return LearningSegment.FUNDAMENTAL_II;
  return LearningSegment.MEDIO;
}

function saoPauloMidnight(calendarDate: Date): Date {
  // Resolve the IANA offset for the requested date instead of assuming UTC-3.
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: LEARNING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  let instant = calendarDate.getTime();
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = formatter.formatToParts(new Date(instant));
    const value = (type: string) =>
      Number(parts.find((part) => part.type === type)!.value);
    const local = Date.UTC(
      value('year'),
      value('month') - 1,
      value('day'),
      value('hour'),
      value('minute'),
      value('second'),
    );
    instant += calendarDate.getTime() - local;
  }
  return new Date(instant);
}

export function missionWeek(weekStart: string): {
  startsAt: Date;
  endsAt: Date;
} {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart))
    throw new BadRequestException('weekStart must be a Monday date');
  const calendarDate = new Date(`${weekStart}T00:00:00.000Z`);
  if (
    !Number.isFinite(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== weekStart ||
    calendarDate.getUTCDay() !== 1
  ) {
    throw new BadRequestException('weekStart must be a valid Monday date');
  }
  const next = new Date(calendarDate);
  next.setUTCDate(next.getUTCDate() + 7);
  return {
    startsAt: saoPauloMidnight(calendarDate),
    endsAt: saoPauloMidnight(next),
  };
}
