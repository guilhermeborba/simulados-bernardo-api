import { UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  AccessTokenPayload,
  assertCurrentAccessUser,
} from './access-token-user';

describe('Current access account and session version', () => {
  const findFirst = jest.fn();
  const prisma = { user: { findFirst } } as unknown as PrismaService;
  const token: AccessTokenPayload = {
    sub: 'account-1',
    email: 'old@example.test',
    role: UserRole.TEACHER,
    type: 'access',
    authVersion: 2,
  };
  const current = {
    id: 'account-1',
    email: 'current@example.test',
    role: UserRole.TEACHER,
  };
  beforeEach(() => {
    findFirst.mockReset().mockResolvedValue(current);
  });

  it('uses the database identity and restricts current role, active status and exact session version', async () => {
    await expect(assertCurrentAccessUser(prisma, token)).resolves.toEqual(
      current,
    );
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'account-1',
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        deletedAt: null,
        authVersion: 2,
      },
      select: { id: true, email: true, role: true },
    });
  });
  it('treats only an omitted legacy version as zero', async () => {
    const { authVersion: _version, ...legacy } = token;
    void _version;
    await assertCurrentAccessUser(prisma, legacy);
    expect(findFirst.mock.calls[0][0].where.authVersion).toBe(0);
  });
  it.each([
    'role changed',
    'account inactive',
    'account deleted',
    'password reset advanced version',
    'account absent',
  ])('rejects when the database filter excludes the account: %s', async () => {
    findFirst.mockResolvedValue(null);
    await expect(assertCurrentAccessUser(prisma, token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it.each([
    { authVersion: -1 },
    { authVersion: 1.5 },
    { authVersion: '2' },
    { authVersion: null },
    { authVersion: Number.NaN },
    { authVersion: Number.POSITIVE_INFINITY },
    { type: 'refresh' },
    { sub: '' },
    { sub: 42 },
    { role: undefined },
    { role: null },
    { role: 'OWNER' },
    { email: undefined },
    { email: null },
    { email: 42 },
    { email: '' },
  ])(
    'rejects malformed signed claims before looking up accounts: %p',
    async (claims) => {
      await expect(
        assertCurrentAccessUser(prisma, {
          ...token,
          ...claims,
        } as unknown as AccessTokenPayload),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(findFirst).not.toHaveBeenCalled();
    },
  );
});
