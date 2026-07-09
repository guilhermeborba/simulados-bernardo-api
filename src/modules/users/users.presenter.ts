import { User } from '@prisma/client';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  status: User['status'];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}
