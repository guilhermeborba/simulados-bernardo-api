import 'reflect-metadata';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateLearningPreferencesDto } from './dto/update-learning-preferences.dto';
import {
  DEFAULT_LEARNING_PREFERENCES,
  LearningPreferencesService,
} from './learning-preferences.service';

const defaults = { ...DEFAULT_LEARNING_PREFERENCES };

describe('Learning preferences strict PATCH validation', () => {
  it.each([
    { segment: 'invalid' },
    { schoolYear: '3' },
    { schoolYear: 3.5 },
    { schoolYear: -3 },
    { schoolYear: 13 },
    { audioEnabled: 'false' },
    { motionEnabled: 0 },
    { audioEnabled: null },
    { motionEnabled: null },
    { userId: 'another-user' },
    { arbitrary: true },
  ])('rejects %p', (payload) => {
    const dto = plainToInstance(UpdateLearningPreferencesDto, payload);
    expect(
      validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).length,
    ).toBeGreaterThan(0);
  });

  it.each([
    {},
    { segment: null, schoolYear: null },
    { segment: 'INFANTIL', schoolYear: -2 },
    { audioEnabled: false, motionEnabled: true },
  ])('accepts %p without transforming values', (payload) => {
    const dto = plainToInstance(UpdateLearningPreferencesDto, payload);
    expect(
      validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }),
    ).toEqual([]);
    expect(dto).toEqual(payload);
  });
});

describe('LearningPreferencesService', () => {
  const user = { findFirst: jest.fn() };
  const tx = {
    $queryRaw: jest.fn(),
    learningPreferences: { findUnique: jest.fn(), upsert: jest.fn() },
  };
  const prisma = {
    user,
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const service = new LearningPreferencesService(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    user.findFirst.mockResolvedValue({ learningPreferences: null });
    tx.$queryRaw.mockResolvedValue([{ id: 'current-user' }]);
    tx.learningPreferences.findUnique.mockResolvedValue(null);
    tx.learningPreferences.upsert.mockImplementation(
      (args: { update: unknown }) => args.update,
    );
  });

  it('returns only defaults and does not mutate existing users on GET', async () => {
    expect(await service.getMe('current-user')).toEqual(defaults);
    expect(user.findFirst).toHaveBeenCalledWith({
      where: { id: 'current-user', status: 'ACTIVE', deletedAt: null },
      select: {
        learningPreferences: {
          select: {
            segment: true,
            schoolYear: true,
            audioEnabled: true,
            motionEnabled: true,
          },
        },
      },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(tx.learningPreferences.upsert).not.toHaveBeenCalled();
  });

  it('rejects inactive or deleted users even with a formerly valid JWT', async () => {
    user.findFirst.mockResolvedValue(null);
    await expect(service.getMe('current-user')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    tx.$queryRaw.mockResolvedValue([]);
    await expect(
      service.updateMe('current-user', { audioEnabled: true }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tx.learningPreferences.upsert).not.toHaveBeenCalled();
  });

  it.each([undefined, ''])(
    'rejects a missing subject %p before any database query',
    async (id) => {
      await expect(service.getMe(id as string)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(
        service.updateMe(id as string, { audioEnabled: true }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(user.findFirst).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it('merges partial changes with the current persisted state in the locked transaction', async () => {
    tx.learningPreferences.findUnique.mockResolvedValue({
      ...defaults,
      segment: 'MEDIO',
      schoolYear: 10,
      motionEnabled: false,
    });
    expect(
      await service.updateMe('current-user', { audioEnabled: true }),
    ).toEqual({
      ...defaults,
      segment: 'MEDIO',
      schoolYear: 10,
      audioEnabled: true,
      motionEnabled: false,
    });
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.learningPreferences.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'current-user' } }),
    );
    expect(tx.learningPreferences.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'current-user' },
        create: {
          userId: 'current-user',
          segment: 'MEDIO',
          schoolYear: 10,
          audioEnabled: true,
          motionEnabled: false,
        },
      }),
    );
  });

  it('clears nullable filters explicitly while preserving accessibility choices', async () => {
    tx.learningPreferences.findUnique.mockResolvedValue({
      ...defaults,
      segment: 'INFANTIL',
      schoolYear: -1,
      audioEnabled: true,
    });
    expect(
      await service.updateMe('current-user', {
        segment: null,
        schoolYear: null,
      }),
    ).toEqual({ ...defaults, audioEnabled: true });
  });

  it('validates the combined state before changing any stored preference', async () => {
    tx.learningPreferences.findUnique.mockResolvedValue({
      ...defaults,
      segment: 'INFANTIL',
      schoolYear: -1,
    });
    await expect(
      service.updateMe('current-user', {
        segment: 'MEDIO',
        audioEnabled: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.updateMe('current-user', { segment: null }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.learningPreferences.upsert).not.toHaveBeenCalled();
  });

  it('allows choosing a segment without a school year', async () => {
    expect(
      await service.updateMe('current-user', { segment: 'ENFERMAGEM' }),
    ).toEqual({ ...defaults, segment: 'ENFERMAGEM' });
  });

  it('does not create a row for an empty PATCH', async () => {
    expect(await service.updateMe('current-user', {})).toEqual(defaults);
    expect(tx.learningPreferences.upsert).not.toHaveBeenCalled();
  });

  it('preserves the timestamp by skipping a no-op update', async () => {
    tx.learningPreferences.findUnique.mockResolvedValue({
      ...defaults,
      segment: 'MEDIO',
      schoolYear: 11,
    });
    expect(
      await service.updateMe('current-user', {
        segment: 'MEDIO',
        schoolYear: 11,
      }),
    ).toEqual({ ...defaults, segment: 'MEDIO', schoolYear: 11 });
    expect(tx.learningPreferences.upsert).not.toHaveBeenCalled();
  });
});
