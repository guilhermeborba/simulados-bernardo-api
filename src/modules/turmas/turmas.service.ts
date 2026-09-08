import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { UserRole } from '@prisma/client';
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

  listTurmas() {
    return this.prisma.turma.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { memberships: true, simulations: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Devolve o token em texto puro uma única vez — no banco fica só o hash, e
   * não há como recuperá-lo depois. Se o professor perder o link, gera outro.
   */
  async createInvite(turmaId: string, dto: CreateInviteDto, createdById: string) {
    const turma = await this.prisma.turma.findFirst({
      where: { id: turmaId, deletedAt: null },
    });

    if (!turma) {
      throw new NotFoundException('Turma not found');
    }

    const token = randomBytes(32).toString('base64url');

    const invite = await this.prisma.turmaInvite.create({
      data: {
        turmaId: turma.id,
        tokenHash: hashToken(token),
        label: dto.label?.trim(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        maxUses: dto.maxUses ?? null,
        createdById,
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
  }

  async revokeInvite(inviteId: string) {
    const invite = await this.prisma.turmaInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    return this.prisma.turmaInvite.update({
      where: { id: inviteId },
      data: { revokedAt: invite.revokedAt ?? new Date() },
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
      throw new ForbiddenException('Convite já foi usado o número máximo de vezes');
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

  async listMyTurmas(userId: string) {
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
  ): Promise<void> {
    if (turmaId === null) {
      return;
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
      return;
    }

    const membership = await this.prisma.turmaMembership.findUnique({
      where: { turmaId_userId: { turmaId, userId: user.id } },
      select: { id: true },
    });

    // Devolve "não encontrado", e não "proibido", de propósito: quem não é da
    // turma não deve conseguir descobrir que o simulado existe.
    if (!membership) {
      throw new NotFoundException('Published simulation not found');
    }
  }
}
