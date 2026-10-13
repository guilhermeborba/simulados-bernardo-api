import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LearningSegment } from '@prisma/client';
import { CreateMissionDto } from './create-mission.dto';
import { LearningQueryDto } from './learning-query.dto';
import { UpdateMissionDto } from './update-mission.dto';

const valid = {
  title: ' Missão da semana ',
  description: ' Explorar um tema. ',
  segment: LearningSegment.FUNDAMENTAL_I,
  schoolYear: 3,
  weekStart: '2026-10-12',
  slot: 1,
  activityKeys: ['soma-3ano'],
};

describe('mission input contracts', () => {
  it('normalizes editorial text and permits a public mission', async () => {
    const dto = plainToInstance(CreateMissionDto, valid);
    expect(await validate(dto)).toEqual([]);
    expect(dto.title).toBe('Missão da semana');
    expect(dto.description).toBe('Explorar um tema.');
  });

  it.each([
    { slot: 0 },
    { slot: 3 },
    { schoolYear: 13 },
    { schoolYear: '3' },
    { title: '  ' },
    { description: '' },
    { segment: 'PRIMARY' },
    { activityKeys: [] },
    { activityKeys: ['one', 'one'] },
    { activityKeys: ['one', 'two', 'three', 'four', 'five', 'six'] },
    { activityKeys: ['Not a quiz key'] },
    { turmaId: '' },
  ])('rejects invalid mission input %j', async (patch) => {
    expect(
      await validate(plainToInstance(CreateMissionDto, { ...valid, ...patch })),
    ).not.toEqual([]);
  });

  it('permits explicit null only for the public turma choice', async () => {
    expect(
      await validate(plainToInstance(UpdateMissionDto, { turmaId: null })),
    ).toEqual([]);
    for (const key of [
      'title',
      'description',
      'segment',
      'schoolYear',
      'slot',
      'weekStart',
      'activityKeys',
    ]) {
      expect(
        await validate(plainToInstance(UpdateMissionDto, { [key]: null })),
      ).not.toEqual([]);
    }
  });

  it.each(['-2', '-1', '0', '3', '12'])(
    'accepts supported query year %s',
    async (year) => {
      const dto = plainToInstance(LearningQueryDto, { schoolYear: year });
      expect(await validate(dto)).toEqual([]);
      expect(dto.schoolYear).toBe(Number(year));
    },
  );

  it.each(['', '2e0', '3.0', '3a', '13', '-3', null, ['3', '4']])(
    'rejects malformed query year %j',
    async (year) => {
      expect(
        await validate(plainToInstance(LearningQueryDto, { schoolYear: year })),
      ).not.toEqual([]);
    },
  );
});
