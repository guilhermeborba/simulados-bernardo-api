import { createHash } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { User, UserRole, UserStatus } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TurmasService } from '../turmas/turmas.service';
import { AuthService } from './auth.service';
import { AuthTokenPayload } from './types/auth-token-payload';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    updateLastLogin: jest.Mock;
    findByIdOrThrow: jest.Mock;
    toSafeUser: jest.Mock;
  };
  let prisma: {
    $transaction: jest.Mock;
    $queryRaw: jest.Mock;
    user: { findUnique: jest.Mock };
    refreshToken: {
      updateMany: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };

  const activeUser: User = {
    id: 'user-1',
    name: 'Aluno Teste',
    email: 'aluno@example.com',
    passwordHash: 'hashed-password',
    authVersion: 0,
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    lastLoginAt: null,
    deletedAt: null,
  };
  const safeUser = {
    id: activeUser.id,
    name: activeUser.name,
    email: activeUser.email,
    role: activeUser.role,
    status: activeUser.status,
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
    lastLoginAt: activeUser.lastLoginAt,
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      updateLastLogin: jest.fn(),
      findByIdOrThrow: jest.fn(),
      toSafeUser: jest.fn().mockReturnValue(safeUser),
    };
    prisma = {
      $transaction: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ id: activeUser.id }]),
      user: { findUnique: jest.fn().mockResolvedValue(activeUser) },
      refreshToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({ id: 'refresh-record-1' }),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    jwtService = {
      signAsync: jest.fn(async (payload: AuthTokenPayload) => {
        return `${payload.type}-token-${payload.sub}`;
      }),
      verifyAsync: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: TurmasService,
          useValue: {
            assertInviteUsable: jest.fn(),
            redeemInvite: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };

              return values[key];
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('registers an active student and does not persist plain password', async () => {
    usersService.create.mockImplementation(
      async (input: { passwordHash: string }) => {
        expect(input.passwordHash).not.toBe('password123');
        await expect(compare('password123', input.passwordHash)).resolves.toBe(
          true,
        );

        const saved = { ...activeUser, passwordHash: input.passwordHash };
        prisma.user.findUnique.mockResolvedValue(saved);
        return saved;
      },
    );

    const response = await service.register({
      name: 'Aluno Teste',
      email: 'ALUNO@example.com',
      password: 'password123',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Aluno Teste',
        email: 'ALUNO@example.com',
        status: UserStatus.ACTIVE,
      }),
    );
    expect(response).toMatchObject({
      user: safeUser,
      accessToken: 'access-token-user-1',
      refreshToken: 'refresh-token-user-1',
    });
    expect(prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: activeUser.id,
          tokenHash: hashToken('refresh-token-user-1'),
        }),
      }),
    );
  });

  it('logs in an active user with valid credentials', async () => {
    const saved = { ...activeUser, passwordHash: await hash('password123', 4) };
    usersService.findByEmail.mockResolvedValue(saved);
    prisma.user.findUnique.mockResolvedValue(saved);

    const response = await service.login({
      email: 'aluno@example.com',
      password: 'password123',
    });

    expect(usersService.updateLastLogin).toHaveBeenCalledWith(activeUser.id);
    expect(response.accessToken).toBe('access-token-user-1');
    expect(response.refreshToken).toBe('refresh-token-user-1');
  });

  it.each([
    ['password changed', { passwordHash: 'replacement-hash' }],
    ['session version advanced', { authVersion: 1 }],
    ['role changed', { role: UserRole.GUARDIAN }],
  ])(
    'does not issue tokens when %s after password verification',
    async (_label, changes) => {
      const password = 'password123';
      const user = { ...activeUser, passwordHash: await hash(password, 4) };
      usersService.findByEmail.mockResolvedValue(user);
      prisma.user.findUnique.mockResolvedValue({ ...user, ...changes });
      await expect(
        service.login({ email: user.email, password }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates refresh token when refreshing a session', async () => {
    const refreshToken = 'valid-refresh-token-with-enough-length';
    jwtService.verifyAsync.mockResolvedValue({
      sub: activeUser.id,
      email: activeUser.email,
      role: activeUser.role,
      type: 'refresh',
    });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'stored-refresh-token',
      userId: activeUser.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: activeUser,
    });
    prisma.refreshToken.create.mockResolvedValue({ id: 'new-refresh-token' });

    const response = await service.refresh({ refreshToken });

    expect(response.refreshToken).toBe('refresh-token-user-1');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'stored-refresh-token',
        userId: activeUser.id,
        revokedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'stored-refresh-token' },
      data: { replacedByTokenId: 'new-refresh-token' },
    });
  });

  it('revokes refresh token on logout', async () => {
    const refreshToken = 'valid-refresh-token-with-enough-length';
    jwtService.verifyAsync.mockResolvedValue({
      sub: activeUser.id,
      email: activeUser.email,
      role: activeUser.role,
      type: 'refresh',
    });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'stored-refresh-token',
      userId: activeUser.id,
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
      replacedByTokenId: null,
    });

    await expect(service.logout({ refreshToken })).resolves.toEqual({
      success: true,
    });
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { id: 'stored-refresh-token', userId: activeUser.id },
      data: { revokedAt: expect.any(Date) },
    });
  });

  describe('refresh validation and consumption', () => {
    const refreshToken = 'valid-refresh-token-with-enough-length';

    beforeEach(() => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: activeUser.id,
        email: activeUser.email,
        role: activeUser.role,
        type: 'refresh',
      });
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'stored-refresh-token',
        userId: activeUser.id,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        user: activeUser,
      });
    });

    it.each([
      ['missing', null],
      ['revoked', { revokedAt: new Date() }],
      ['expired', { expiresAt: new Date(Date.now() - 1_000) }],
      ['another user', { userId: 'another-user' }],
      [
        'inactive user',
        { user: { ...activeUser, status: UserStatus.BLOCKED } },
      ],
      ['deleted user', { user: { ...activeUser, deletedAt: new Date() } }],
    ])(
      'rejects a %s token without issuing another pair',
      async (_label, change) => {
        if (change === null) {
          prisma.refreshToken.findUnique.mockResolvedValue(null);
        } else {
          prisma.refreshToken.findUnique.mockResolvedValue({
            id: 'stored-refresh-token',
            userId: activeUser.id,
            expiresAt: new Date(Date.now() + 60_000),
            revokedAt: null,
            user: activeUser,
            ...change,
          });
        }

        await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(
          UnauthorizedException,
        );
        expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(prisma.refreshToken.create).not.toHaveBeenCalled();
      },
    );

    it('rejects the request that loses conditional token consumption', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.refresh({ refreshToken })).rejects.toMatchObject({
        status: 401,
        message: 'Invalid refresh token',
      });
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it.each([
      { sub: undefined },
      { sub: '' },
      { email: undefined },
      { role: undefined },
      { role: 'OWNER' },
      { authVersion: null },
      { authVersion: -1 },
      { authVersion: '0' },
    ])(
      'rejects malformed signed refresh claims before a transaction: %p',
      async (claims) => {
        jwtService.verifyAsync.mockResolvedValue({
          sub: activeUser.id,
          email: activeUser.email,
          role: activeUser.role,
          type: 'refresh',
          ...claims,
        });
        await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(
          UnauthorizedException,
        );
        expect(prisma.$transaction).not.toHaveBeenCalled();
      },
    );

    it('rejects an invalid signature before opening a transaction', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects access tokens passed as refresh tokens', async () => {
      jwtService.verifyAsync.mockResolvedValue({ type: 'access' });

      await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  it('does not revoke a token owned by another subject on logout', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: activeUser.id,
      email: activeUser.email,
      role: activeUser.role,
      type: 'refresh',
    });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'other-token',
      userId: 'another-user',
    });

    await expect(service.logout({ refreshToken: 'token' })).resolves.toEqual({
      success: true,
    });
    expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
  });
});
