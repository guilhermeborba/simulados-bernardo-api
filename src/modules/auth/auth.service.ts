import { createHash, randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User, UserStatus } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SafeUser } from '../users/users.presenter';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokenPayload } from './types/auth-token-payload';

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

@Injectable()
export class AuthService {
  private readonly passwordSaltRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await hash(dto.password, this.passwordSaltRounds);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      status: UserStatus.ACTIVE,
    });

    const tokens = await this.createTokenPair(user);

    return this.toAuthResponse(user, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.assertCanAuthenticate(user);
    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.createTokenPair(user);

    return this.toAuthResponse(user, tokens);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const tokenHash = this.hashToken(dto.refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      storedToken.userId !== payload.sub
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.assertCanAuthenticate(storedToken.user);

    const tokens = await this.createTokenPair(storedToken.user);

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        replacedByTokenId: tokens.refreshTokenId,
      },
    });

    return this.toAuthResponse(storedToken.user, tokens);
  }

  async logout(dto: RefreshTokenDto): Promise<{ success: true }> {
    await this.verifyRefreshToken(dto.refreshToken);

    const tokenHash = this.hashToken(dto.refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (storedToken && !storedToken.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
    }

    return { success: true };
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findByIdOrThrow(userId);
    return this.usersService.toSafeUser(user);
  }

  private async createTokenPair(user: User): Promise<TokenPair> {
    const refreshTokenId = randomUUID();
    const accessToken = await this.jwtService.signAsync(
      this.createTokenPayload(user, 'access'),
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.getJwtExpiresIn('JWT_ACCESS_EXPIRES_IN'),
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        ...this.createTokenPayload(user, 'refresh'),
        jti: refreshTokenId,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.getJwtExpiresIn('JWT_REFRESH_EXPIRES_IN'),
      },
    );
    const storedRefreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(
          Date.now() +
            this.parseDurationToMs(
              this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
            ),
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenId: storedRefreshToken.id,
    };
  }

  private createTokenPayload(
    user: User,
    type: AuthTokenPayload['type'],
  ): AuthTokenPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      type,
    };
  }

  private async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthTokenPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getJwtExpiresIn(key: string): JwtSignOptions['expiresIn'] {
    return this.configService.getOrThrow<string>(
      key,
    ) as JwtSignOptions['expiresIn'];
  }

  private parseDurationToMs(duration: string): number {
    const match = /^(\d+)([smhd])?$/.exec(duration);

    if (!match) {
      throw new Error(`Unsupported duration format: ${duration}`);
    }

    const value = Number(match[1]);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  private assertCanAuthenticate(user: User): void {
    if (user.deletedAt || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }
  }

  private toAuthResponse(user: User, tokens: TokenPair): AuthResponse {
    return {
      user: this.usersService.toSafeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
