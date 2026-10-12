import { createHash, randomUUID } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { TurmasService } from '../src/modules/turmas/turmas.service';
import { UsersService } from '../src/modules/users/users.service';

// Opt-in: use only a disposable local PostgreSQL, never the application's URL.
const databaseUrl = process.env.AUTH_REFRESH_TEST_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

describeWithDatabase('Refresh token transactions (PostgreSQL)', () => {
  let prisma: PrismaService;
  let jwt: JwtService;
  let service: AuthService;
  let user: User;
  let synchronizeReads = false;
  let reads = 0;
  let releaseReads: () => void;
  let bothRead: Promise<void>;

  beforeAll(async () => {
    const url = new URL(databaseUrl!);
    if (
      url.hostname !== '127.0.0.1' ||
      url.pathname !== '/auth_refresh_test' ||
      url.username !== 'auth_refresh_test' ||
      !url.port ||
      url.port === '5432'
    ) {
      throw new Error(
        'Refresh integration tests require a disposable local database',
      );
    }

    prisma = new PrismaService({ datasources: { db: { url: databaseUrl } } });
    // Force both requests to read the same unused row before either consumes it.
    prisma.$use(async (params, next) => {
      const result: unknown = await next(params);
      if (
        synchronizeReads &&
        params.model === 'RefreshToken' &&
        params.action === 'findUnique' &&
        params.args?.include?.user === true
      ) {
        reads += 1;
        if (reads === 2) {
          releaseReads();
        }
        await bothRead;
      }
      return result;
    });
    await prisma.$connect();
    jwt = new JwtService();
    const config = new ConfigService({
      JWT_ACCESS_SECRET: 'integration-access-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_SECRET: 'integration-refresh-secret',
      JWT_REFRESH_EXPIRES_IN: '7d',
    });
    service = new AuthService(
      new UsersService(prisma),
      prisma,
      jwt,
      config,
      new TurmasService(prisma),
    );
  });

  beforeEach(async () => {
    synchronizeReads = false;
    reads = 0;
    bothRead = new Promise<void>((resolve) => {
      releaseReads = resolve;
    });
    user = await prisma.user.create({
      data: {
        name: 'Synthetic refresh test',
        email: `refresh-${randomUUID()}@example.test`,
        passwordHash: 'unused-test-hash',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
      },
    });
  });

  afterEach(async () => {
    synchronizeReads = false;
    jest.restoreAllMocks();
    if (user && prisma) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  async function createSession(expiresAt = new Date(Date.now() + 60_000)) {
    const refreshToken = await jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh',
        jti: randomUUID(),
      },
      { secret: 'integration-refresh-secret', expiresIn: '7d' },
    );
    const stored = await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: tokenHash(refreshToken), expiresAt },
    });
    return { refreshToken, stored };
  }

  async function expectOriginalSessionUnchanged(id: string) {
    expect(
      await prisma.refreshToken.count({ where: { userId: user.id } }),
    ).toBe(1);
    expect(
      await prisma.refreshToken.findUnique({ where: { id } }),
    ).toMatchObject({
      revokedAt: null,
      replacedByTokenId: null,
    });
  }

  it('allows exactly one of two concurrent requests to rotate the same token', async () => {
    const { refreshToken, stored } = await createSession();
    synchronizeReads = true;

    const results = await Promise.allSettled([
      service.refresh({ refreshToken }),
      service.refresh({ refreshToken }),
    ]);
    synchronizeReads = false;

    expect(reads).toBe(2);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const failure = results.find((result) => result.status === 'rejected');
    expect(
      failure && failure.status === 'rejected' && failure.reason,
    ).toBeInstanceOf(UnauthorizedException);
    const rows = await prisma.refreshToken.findMany({
      where: { userId: user.id },
    });
    expect(rows).toHaveLength(2);
    const successor = rows.find((row) => row.id !== stored.id)!;
    expect(successor.revokedAt).toBeNull();
    expect(rows.find((row) => row.id === stored.id)).toMatchObject({
      revokedAt: expect.any(Date),
      replacedByTokenId: successor.id,
    });
    const success = results.find((result) => result.status === 'fulfilled');
    if (success?.status !== 'fulfilled') {
      throw new Error('Expected one successful refresh');
    }
    expect(successor.tokenHash).toBe(tokenHash(success.value.refreshToken));
    await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      service.refresh({ refreshToken: success.value.refreshToken }),
    ).resolves.toMatchObject({
      user: { id: user.id },
    });
  });

  it.each(['revoked', 'expired'] as const)(
    'rejects a %s stored token',
    async (state) => {
      const { refreshToken, stored } = await createSession(
        state === 'expired' ? new Date(Date.now() - 1_000) : undefined,
      );
      if (state === 'revoked') {
        await prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revokedAt: new Date() },
        });
      }

      await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(
        await prisma.refreshToken.count({ where: { userId: user.id } }),
      ).toBe(1);
    },
  );

  it('rolls back consumption if signing fails and allows a later retry', async () => {
    const { refreshToken, stored } = await createSession();
    const signer = jest
      .spyOn(jwt, 'signAsync')
      .mockRejectedValueOnce(new Error('Signing unavailable'));

    await expect(service.refresh({ refreshToken })).rejects.toThrow(
      'Signing unavailable',
    );
    await expectOriginalSessionUnchanged(stored.id);
    signer.mockRestore();
    await expect(service.refresh({ refreshToken })).resolves.toMatchObject({
      user: { id: user.id },
    });
  });

  it('rolls back consumption if successor persistence violates a database constraint', async () => {
    const { refreshToken, stored } = await createSession();
    const sign = jwt.signAsync.bind(jwt);
    const signer = jest
      .spyOn(jwt, 'signAsync')
      .mockImplementation(async (payload, options) => {
        return 'type' in payload && payload.type === 'refresh'
          ? refreshToken
          : sign(payload, options);
      });

    await expect(service.refresh({ refreshToken })).rejects.toMatchObject({
      code: 'P2002',
    });
    await expectOriginalSessionUnchanged(stored.id);
    signer.mockRestore();
    await expect(service.refresh({ refreshToken })).resolves.toMatchObject({
      user: { id: user.id },
    });
  });

  it('rolls back both consumed token and inserted successor if linking fails', async () => {
    const { refreshToken, stored } = await createSession();
    await prisma.$executeRawUnsafe(`
      CREATE FUNCTION reject_refresh_link() RETURNS trigger AS $$
      BEGIN RAISE EXCEPTION 'synthetic link failure'; END;
      $$ LANGUAGE plpgsql
    `);
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TRIGGER reject_refresh_link BEFORE UPDATE OF "replacedByTokenId"
        ON "RefreshToken" FOR EACH ROW EXECUTE FUNCTION reject_refresh_link()
      `);
      try {
        await expect(service.refresh({ refreshToken })).rejects.toThrow();
        await expectOriginalSessionUnchanged(stored.id);
      } finally {
        await prisma.$executeRawUnsafe(
          'DROP TRIGGER reject_refresh_link ON "RefreshToken"',
        );
      }
    } finally {
      await prisma.$executeRawUnsafe('DROP FUNCTION reject_refresh_link()');
    }
    await expect(service.refresh({ refreshToken })).resolves.toMatchObject({
      user: { id: user.id },
    });
  });

  it('logs out the active descendant when receiving an older rotated token', async () => {
    const { refreshToken } = await createSession();
    const first = await service.refresh({ refreshToken });
    const second = await service.refresh({ refreshToken: first.refreshToken });

    await expect(service.logout({ refreshToken })).resolves.toEqual({
      success: true,
    });
    const rows = await prisma.refreshToken.findMany({
      where: { userId: user.id },
    });
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.revokedAt !== null)).toBe(true);
    await expect(
      service.refresh({ refreshToken: second.refreshToken }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('leaves no renewable session when logout races with refresh', async () => {
    const { refreshToken } = await createSession();
    const [refresh, logout] = await Promise.allSettled([
      service.refresh({ refreshToken }),
      service.logout({ refreshToken }),
    ]);

    expect(logout.status).toBe('fulfilled');
    expect(
      await prisma.refreshToken.count({
        where: { userId: user.id, revokedAt: null },
      }),
    ).toBe(0);
    if (refresh.status === 'fulfilled') {
      await expect(
        service.refresh({ refreshToken: refresh.value.refreshToken }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    } else {
      expect(refresh.reason).toBeInstanceOf(UnauthorizedException);
    }
  });
});
