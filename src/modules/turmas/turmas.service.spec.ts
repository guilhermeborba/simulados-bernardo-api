import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TurmasService } from './turmas.service';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('TurmasService', () => {
  let service: TurmasService;
  let prisma: {
    turma: { findFirst: jest.Mock };
    turmaInvite: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    turmaMembership: { create: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  const turma = { id: 'turma-1', name: '3º ano', deletedAt: null };

  beforeEach(async () => {
    prisma = {
      turma: { findFirst: jest.fn().mockResolvedValue(turma) },
      turmaInvite: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      turmaMembership: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn(async (operations: unknown[]) => operations),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TurmasService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(TurmasService);
  });

  function inviteFrom(token: string, overrides: Record<string, unknown> = {}) {
    return {
      id: 'invite-1',
      turmaId: turma.id,
      tokenHash: sha256(token),
      expiresAt: null,
      maxUses: null,
      usedCount: 0,
      revokedAt: null,
      turma,
      ...overrides,
    };
  }

  it('stores only the hash of the invite token', async () => {
    prisma.turmaInvite.create.mockImplementation(async ({ data }: never) => ({
      id: 'invite-1',
      ...(data as Record<string, unknown>),
    }));

    const result = await service.createInvite('turma-1', {}, 'admin-1');

    const stored = prisma.turmaInvite.create.mock.calls[0][0].data.tokenHash;
    expect(stored).toBe(sha256(result.token));
    expect(stored).not.toBe(result.token);
  });

  it('creates the membership and consumes one use of the invite', async () => {
    const token = 'token-de-teste-com-tamanho-suficiente';
    prisma.turmaInvite.findUnique.mockResolvedValue(inviteFrom(token));
    prisma.turmaMembership.create.mockResolvedValue({ turma });

    await expect(service.redeemInvite(token, 'aluno-1')).resolves.toMatchObject({
      alreadyMember: false,
    });
    expect(prisma.turmaInvite.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { usedCount: { increment: 1 } },
    });
  });

  it('does not consume another use when the student is already a member', async () => {
    const token = 'token-de-teste-com-tamanho-suficiente';
    prisma.turmaInvite.findUnique.mockResolvedValue(inviteFrom(token));
    prisma.turmaMembership.findUnique.mockResolvedValue({ turma });

    await expect(service.redeemInvite(token, 'aluno-1')).resolves.toMatchObject({
      alreadyMember: true,
    });
    expect(prisma.turmaInvite.update).not.toHaveBeenCalled();
    expect(prisma.turmaMembership.create).not.toHaveBeenCalled();
  });

  it('rejects an expired invite', async () => {
    const token = 'token-de-teste-com-tamanho-suficiente';
    prisma.turmaInvite.findUnique.mockResolvedValue(
      inviteFrom(token, { expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(service.redeemInvite(token, 'aluno-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects a revoked invite', async () => {
    const token = 'token-de-teste-com-tamanho-suficiente';
    prisma.turmaInvite.findUnique.mockResolvedValue(
      inviteFrom(token, { revokedAt: new Date() }),
    );

    await expect(service.redeemInvite(token, 'aluno-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects an invite that ran out of uses', async () => {
    const token = 'token-de-teste-com-tamanho-suficiente';
    prisma.turmaInvite.findUnique.mockResolvedValue(
      inviteFrom(token, { maxUses: 2, usedCount: 2 }),
    );

    await expect(service.redeemInvite(token, 'aluno-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('lets anyone through when the simulation belongs to no turma', async () => {
    await expect(
      service.assertCanAccessTurma(null, { id: 'aluno-1', role: UserRole.STUDENT }),
    ).resolves.toBeUndefined();
    expect(prisma.turmaMembership.findUnique).not.toHaveBeenCalled();
  });

  it('lets a member of the turma through', async () => {
    prisma.turmaMembership.findUnique.mockResolvedValue({ id: 'membership-1' });

    await expect(
      service.assertCanAccessTurma('turma-1', {
        id: 'aluno-1',
        role: UserRole.STUDENT,
      }),
    ).resolves.toBeUndefined();
  });

  it('hides the simulation from a student who is not a member', async () => {
    prisma.turmaMembership.findUnique.mockResolvedValue(null);

    await expect(
      service.assertCanAccessTurma('turma-1', {
        id: 'estranho',
        role: UserRole.STUDENT,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lets admin through without a membership', async () => {
    await expect(
      service.assertCanAccessTurma('turma-1', {
        id: 'admin-1',
        role: UserRole.ADMIN,
      }),
    ).resolves.toBeUndefined();
    expect(prisma.turmaMembership.findUnique).not.toHaveBeenCalled();
  });
});
