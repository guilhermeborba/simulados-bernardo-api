import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SafeUser, toSafeUser } from './users.presenter';

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  status?: UserStatus;
}

interface UpdateUserInput {
  name?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput): Promise<User> {
    const email = this.normalizeEmail(input.email);
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    return this.prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash: input.passwordHash,
        role: input.role ?? UserRole.STUDENT,
        status: input.status ?? UserStatus.ACTIVE,
      },
    });
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(toSafeUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });
  }

  async update(id: string, input: UpdateUserInput): Promise<SafeUser> {
    await this.findByIdOrThrow(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.role ? { role: input.role } : {}),
      },
    });

    return toSafeUser(user);
  }

  async updateStatus(id: string, status: UserStatus): Promise<SafeUser> {
    await this.findByIdOrThrow(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    return toSafeUser(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });
  }

  toSafeUser(user: User): SafeUser {
    return toSafeUser(user);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
