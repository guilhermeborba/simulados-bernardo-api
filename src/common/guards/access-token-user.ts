import { UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access';
  authVersion?: number;
}
/** Tokens issued before this additive migration represent session version zero. */
export async function assertCurrentAccessUser(
  prisma: PrismaService,
  payload: AccessTokenPayload,
) {
  const version = payload.authVersion === undefined ? 0 : payload.authVersion;
  if (
    payload.type !== 'access' ||
    !Object.values(UserRole).includes(payload.role) ||
    typeof payload.email !== 'string' ||
    !payload.email ||
    !Number.isInteger(version) ||
    version < 0 ||
    typeof payload.sub !== 'string' ||
    !payload.sub
  )
    throw new UnauthorizedException('Invalid access token');
  const user = await prisma.user.findFirst({
    where: {
      id: payload.sub,
      role: payload.role,
      status: UserStatus.ACTIVE,
      deletedAt: null,
      authVersion: version,
    },
    select: { id: true, email: true, role: true },
  });
  if (!user) throw new UnauthorizedException('Invalid access token');
  return user;
}
