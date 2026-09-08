import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { RequestWithUser } from './jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
  } as unknown as ConfigService;

  function contextFor(request: RequestWithUser): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('lets an anonymous request through without a user', async () => {
    const guard = new OptionalJwtAuthGuard(
      { verifyAsync: jest.fn() } as unknown as JwtService,
      configService,
    );
    const request = { headers: {} } as RequestWithUser;

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('identifies the user when the token is valid', async () => {
    const guard = new OptionalJwtAuthGuard(
      {
        verifyAsync: jest.fn().mockResolvedValue({
          sub: 'user-1',
          email: 'aluno@example.com',
          role: UserRole.STUDENT,
          type: 'access',
        }),
      } as unknown as JwtService,
      configService,
    );
    const request = {
      headers: { authorization: 'Bearer token' },
    } as RequestWithUser;

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ id: 'user-1' });
  });

  it('rejects an expired token instead of falling back to anonymous', async () => {
    const guard = new OptionalJwtAuthGuard(
      {
        verifyAsync: jest.fn().mockRejectedValue(new Error('jwt expired')),
      } as unknown as JwtService,
      configService,
    );
    const request = {
      headers: { authorization: 'Bearer vencido' },
    } as RequestWithUser;

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
