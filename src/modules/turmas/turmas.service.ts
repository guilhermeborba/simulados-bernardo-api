import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { ActivityKind, Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { slugify } from '../../common/utils/slugify';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateTurmaDto } from './dto/create-turma.dto';

/**
 * O token do convite é aleatório e de alta entropia, então o hash não precisa
 * ser lento como o de senha — precisa ser determinístico, para dar para
 * procurar o convite a partir do token que chegou no link.
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class TurmasService {
  constructor(private readonly prisma: PrismaService) {}

  createTurma(dto: CreateTurmaDto) {
    return this.prisma.turma.create({
      data: {
        name: dto.name.trim(),
        slug: slugify(dto.slug ?? dto.name),
        schoolName: dto.schoolName?.trim(),
        schoolYear: dto.schoolYear,
      },
    });
  }

  listTurmas(user: { id: string; role: UserRole }) {
    return this.prisma.turma.findMany({
      where: {
        deletedAt: null,
        ...(user.role === UserRole.TEACHER
          ? { teachers: { some: { teacherId: user.id } } }
          : {}),
      },
      include: {
        _count: {
          select: {
            memberships: true,
            simulations: {
              where: { activityKind: ActivityKind.SIMULATION, deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Devolve o token em texto puro uma única vez — no banco fica só o hash, e
   * não há como recuperá-lo depois. Se o professor perder o link, gera outro.
   */
  async createInvite(
    turmaId: string,
    dto: CreateInviteDto,
    user: { id: string; role: UserRole },
  ) {
    return this.prisma.$transaction(async (database) => {
      await this.assertManagesTurma(turmaId, user, database);
      const turma = await database.turma.findFirstOrThrow({
        where: { id: turmaId },
      });
      const token = randomBytes(32).toString('base64url');
      const invite = await database.turmaInvite.create({
        data: {
          turmaId: turma.id,
          tokenHash: hashToken(token),
          label: dto.label?.trim(),
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          maxUses: dto.maxUses ?? null,
          createdById: user.id,
        },
      });
      return {
        id: invite.id,
        turma: { id: turma.id, name: turma.name, slug: turma.slug },
        label: invite.label,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        token,
      };
    });
  }

  async revokeInvite(inviteId: string, user: { id: string; role: UserRole }) {
    return this.prisma.$transaction(async (database) => {
      const invite = await database.turmaInvite.findUnique({
        where: { id: inviteId },
      });
      if (!invite) throw new NotFoundException('Invite not found');
      await this.assertManagesTurma(invite.turmaId, user, database);
      await database.$queryRaw`SELECT "id" FROM "TurmaInvite" WHERE "id"=${inviteId} FOR UPDATE`;
      const current = await database.turmaInvite.findUniqueOrThrow({
        where: { id: inviteId },
      });
      return database.turmaInvite.update({
        where: { id: inviteId },
        data: { revokedAt: current.revokedAt ?? new Date() },
      });
    });
  }

  /**
   * Troca o token do link pela participação na turma. É este registro que
   * autoriza o acesso daqui em diante: o token não é reapresentado a cada
   * requisição, e por isso não adianta guardá-lo no navegador.
   */
  /**
   * Valida o convite sem consumi-lo. O cadastro chama isto antes de criar a
   * conta: se o link estiver ruim, o erro chega sem deixar um usuário órfão
   * para trás.
   */
  async assertInviteUsable(token: string) {
    const invite = await this.prisma.turmaInvite.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { turma: true },
    });

    if (!invite || invite.revokedAt || invite.turma.deletedAt) {
      throw new NotFoundException('Convite inválido');
    }

    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Convite expirado');
    }

    return invite;
  }

  async redeemInvite(token: string, userId: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!student)
      throw new ForbiddenException('Student account required to join a turma');
    const invite = await this.assertInviteUsable(token);

    const existing = await this.prisma.turmaMembership.findUnique({
      where: { turmaId_userId: { turmaId: invite.turmaId, userId } },
      include: { turma: true },
    });

    // Reentrar com o mesmo link não consome outro uso nem duplica a
    // participação — o aluno que clica duas vezes não gasta a vaga de um colega.
    if (existing) {
      return { turma: existing.turma, alreadyMember: true };
    }

    if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
      throw new ForbiddenException(
        'Convite já foi usado o número máximo de vezes',
      );
    }

    const [membership] = await this.prisma.$transaction([
      this.prisma.turmaMembership.create({
        data: { turmaId: invite.turmaId, userId, inviteId: invite.id },
        include: { turma: true },
      }),
      this.prisma.turmaInvite.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return { turma: membership.turma, alreadyMember: false };
  }

  async listMyTurmas(user: { id: string; role: UserRole }) {
    if (user.role === UserRole.TEACHER) {
      const links = await this.prisma.teacherTurma.findMany({
        where: { teacherId: user.id, turma: { deletedAt: null } },
        include: { turma: true },
        orderBy: { createdAt: 'asc' },
      });
      return links.map((link) => link.turma);
    }
    const userId = user.id;
    const memberships = await this.prisma.turmaMembership.findMany({
      where: { userId, turma: { deletedAt: null } },
      include: { turma: true },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((membership) => membership.turma);
  }

  /**
   * Ids das turmas cujo conteúdo restrito o usuário pode ver. Vazio para quem
   * não está em turma nenhuma, e para quem nem está autenticado.
   */
  async accessibleTurmaIds(userId: string | null): Promise<string[]> {
    if (!userId) {
      return [];
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: UserStatus.ACTIVE, deletedAt: null },
      select: { role: true },
    });
    if (!user) return [];
    if (user.role === UserRole.TEACHER) {
      const links = await this.prisma.teacherTurma.findMany({
        where: { teacherId: userId, turma: { deletedAt: null } },
        select: { turmaId: true },
      });
      return links.map((link) => link.turmaId);
    }
    const memberships = await this.prisma.turmaMembership.findMany({
      where: { userId, turma: { deletedAt: null } },
      select: { turmaId: true },
    });

    return memberships.map((membership) => membership.turmaId);
  }

  /**
   * Porta de entrada de qualquer simulado restrito. Filtrar a listagem não
   * basta: sem esta checagem, quem receber a URL de um simulado da turma entra
   * nele mesmo sem ser convidado.
   */
  async assertCanAccessTurma(
    turmaId: string | null,
    user: { id: string; role: UserRole },
    database: Pick<
      Prisma.TransactionClient,
      'turma' | 'turmaMembership' | 'teacherTurma'
    > = this.prisma,
  ): Promise<void> {
    if (turmaId === null) {
      return;
    }

    const turma = await database.turma.findFirst({
      where: { id: turmaId, deletedAt: null },
      select: { id: true },
    });

    if (!turma) {
      throw new NotFoundException('Published simulation not found');
    }

    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.TEACHER) {
      const assignment = await database.teacherTurma.findUnique({
        where: { teacherId_turmaId: { teacherId: user.id, turmaId } },
        select: { teacherId: true },
      });
      if (assignment) return;
      throw new NotFoundException('Published simulation not found');
    }

    const membership = await database.turmaMembership.findUnique({
      where: { turmaId_userId: { turmaId, userId: user.id } },
      select: { id: true },
    });

    // Devolve "não encontrado", e não "proibido", de propósito: quem não é da
    // turma não deve conseguir descobrir que o simulado existe.
    if (!membership) {
      throw new NotFoundException('Published simulation not found');
    }
  }
  private async assertManagesTurma(
    turmaId: string,
    user: { id: string; role: UserRole },
    database: Prisma.TransactionClient = this.prisma,
  ) {
    await database.$queryRaw`SELECT "id" FROM "User" WHERE "id"=${user.id} FOR SHARE`;
    await database.$queryRaw`SELECT "id" FROM "Turma" WHERE "id"=${turmaId} FOR SHARE`;
    const active = await database.user.findFirst({
      where: {
        id: user.id,
        role: user.role,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!active)
      throw new UnauthorizedException(
        'Active account with current role required',
      );
    const turma = await database.turma.findFirst({
      where: { id: turmaId, deletedAt: null },
      select: { id: true },
    });
    if (!turma) throw new NotFoundException('Turma not found');
    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.TEACHER) {
      await database.$queryRaw`SELECT "teacherId" FROM "TeacherTurma" WHERE "teacherId"=${user.id} AND "turmaId"=${turmaId} FOR SHARE`;
      const assignment = await database.teacherTurma.findUnique({
        where: { teacherId_turmaId: { teacherId: user.id, turmaId } },
        select: { teacherId: true },
      });
      if (assignment) return;
    }
    throw new ForbiddenException('Cannot manage this turma');
  }

  async assignTeacher(
    turmaId: string,
    teacherId: string,
    user: { id: string; role: UserRole },
  ) {
    return this.prisma.$transaction(async (database) => {
      if (user.role !== UserRole.ADMIN)
        throw new ForbiddenException('Administrator required');
      await this.assertManagesTurma(turmaId, user, database);
      await database.$queryRaw`SELECT "id" FROM "User" WHERE "id"=${teacherId} FOR SHARE`;
      const teacher = await database.user.findFirst({
        where: {
          id: teacherId,
          role: UserRole.TEACHER,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!teacher) throw new NotFoundException('Active teacher not found');
      return database.teacherTurma.upsert({
        where: { teacherId_turmaId: { teacherId, turmaId } },
        create: { teacherId, turmaId },
        update: {},
      });
    });
  }

  async unassignTeacher(
    turmaId: string,
    teacherId: string,
    user: { id: string; role: UserRole },
  ): Promise<void> {
    await this.prisma.$transaction(async (database) => {
      if (user.role !== UserRole.ADMIN)
        throw new ForbiddenException('Administrator required');
      await this.assertManagesTurma(turmaId, user, database);
      await database.teacherTurma.deleteMany({ where: { teacherId, turmaId } });
    });
  }
}
