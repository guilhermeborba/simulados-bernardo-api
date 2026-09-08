import 'dotenv/config';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaClient, UserRole } from '@prisma/client';

/**
 * Gera um link de convite para uma turma.
 *
 *   npm run convite -- --turma turma-bernardo
 *   npm run convite -- --turma turma-bernardo --usos 30 --dias 30 --rotulo "WhatsApp dos pais"
 *
 * O token é mostrado uma única vez: no banco fica só o hash. Se o link se
 * perder, gere outro e revogue o antigo.
 */

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const turmaSlug = arg('turma');

  if (!turmaSlug) {
    throw new Error('Informe a turma: --turma <slug>');
  }

  const baseUrl =
    arg('url') ?? process.env.APP_PUBLIC_URL ?? 'http://localhost:3000';

  const turma = await prisma.turma.findFirst({
    where: { slug: turmaSlug, deletedAt: null },
  });

  if (!turma) {
    throw new Error(`Turma não encontrada: ${turmaSlug}`);
  }

  const creator = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });

  if (!creator) {
    throw new Error('Nenhum usuário ADMIN encontrado para registrar o convite');
  }

  const usos = arg('usos');
  const dias = arg('dias');

  const token = randomBytes(32).toString('base64url');

  const invite = await prisma.turmaInvite.create({
    data: {
      turmaId: turma.id,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      label: arg('rotulo'),
      maxUses: usos ? Number(usos) : null,
      expiresAt: dias
        ? new Date(Date.now() + Number(dias) * 24 * 60 * 60 * 1000)
        : null,
      createdById: creator.id,
    },
  });

  console.log(`\nTurma:    ${turma.name}`);
  console.log(`Convite:  ${invite.id}`);
  console.log(`Usos:     ${invite.maxUses ?? 'ilimitados'}`);
  console.log(`Expira:   ${invite.expiresAt?.toISOString() ?? 'nunca'}`);
  console.log(`\nLink para enviar aos alunos:\n`);
  console.log(`  ${baseUrl}/registro?convite=${token}\n`);
  console.log('Guarde o link: o token não pode ser recuperado depois.\n');
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
