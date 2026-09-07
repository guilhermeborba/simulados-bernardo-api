/**
 * Limpeza das tentativas órfãs criadas antes da correção do startAttempt.
 *
 * Até então, cada carregamento da página do simulado inseria uma tentativa
 * nova. O histórico do aluno acumulou registros "em andamento" que ele nunca
 * abriu de propósito.
 *
 * O script NÃO apaga nada por padrão. Sem --apply ele só relata.
 *
 *   npm run limpar:tentativas                       # relatório (dry-run)
 *   npm run limpar:tentativas -- --apply            # apaga o grupo A
 *   npm run limpar:tentativas -- --apply --incluir-inalcancaveis
 *
 * Contra produção, use a mesma URL pública do Postgres usada no seed:
 *   DATABASE_URL="postgresql://..." npm run limpar:tentativas
 *
 * Grupos:
 *   A) em andamento, ZERO respostas, fora da janela de proteção
 *      → descartável: não há nada a perder
 *   B) em andamento, COM respostas, mas já existe uma tentativa mais recente
 *      do mesmo aluno para o mesmo simulado
 *      → inalcançável pelo app, mas tem dados; só sai com a flag explícita
 *   C) todo o resto (a mais recente de cada aluno+simulado, e qualquer uma
 *      dentro da janela de proteção)
 *      → nunca é tocada
 */
import 'dotenv/config';
import { AttemptStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');
const INCLUIR_INALCANCAVEIS = process.argv.includes('--incluir-inalcancaveis');
// Protege quem acabou de abrir um simulado e ainda não respondeu nada.
const JANELA_PROTECAO_MINUTOS = Number(process.env.JANELA_PROTECAO_MINUTOS ?? 60);

function formatar(data: Date) {
  return data.toISOString().replace('T', ' ').slice(0, 16);
}

async function main() {
  const corte = new Date(Date.now() - JANELA_PROTECAO_MINUTOS * 60_000);

  const emAndamento = await prisma.attempt.findMany({
    where: { status: AttemptStatus.IN_PROGRESS },
    include: {
      _count: { select: { answers: true } },
      student: { select: { name: true, email: true } },
      simulation: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // A tentativa mais recente de cada aluno+simulado é a que o app retoma.
  const maisRecentePorChave = new Set<string>();
  const chave = (a: (typeof emAndamento)[number]) => `${a.studentId}::${a.simulationId}`;

  for (const tentativa of emAndamento) {
    if (!maisRecentePorChave.has(chave(tentativa))) {
      maisRecentePorChave.add(chave(tentativa));
    }
  }

  const vistos = new Set<string>();
  const grupoA: typeof emAndamento = [];
  const grupoB: typeof emAndamento = [];
  const grupoC: typeof emAndamento = [];

  for (const tentativa of emAndamento) {
    const k = chave(tentativa);
    const ehAtiva = !vistos.has(k);
    vistos.add(k);

    const dentroDaJanela = tentativa.createdAt > corte;

    if (ehAtiva || dentroDaJanela) {
      grupoC.push(tentativa);
      continue;
    }

    if (tentativa._count.answers === 0) {
      grupoA.push(tentativa);
    } else {
      grupoB.push(tentativa);
    }
  }

  const linha = (t: (typeof emAndamento)[number]) =>
    `  ${formatar(t.createdAt)}  ${String(t._count.answers).padStart(3)} resp.  ` +
    `${(t.student.email ?? '—').padEnd(32)} ${t.simulation.slug}`;

  console.log('');
  console.log(`Tentativas em andamento no banco: ${emAndamento.length}`);
  console.log(`Janela de proteção: ${JANELA_PROTECAO_MINUTOS} min (nada criado depois de ${formatar(corte)} é tocado)`);
  console.log('');

  console.log(`GRUPO A — descartáveis (sem nenhuma resposta): ${grupoA.length}`);
  grupoA.forEach((t) => console.log(linha(t)));
  console.log('');

  console.log(`GRUPO B — com respostas, mas inalcançáveis pelo app: ${grupoB.length}`);
  grupoB.forEach((t) => console.log(linha(t)));
  console.log('');

  console.log(`GRUPO C — preservadas (ativas ou recentes): ${grupoC.length}`);
  console.log('');

  if (!APPLY) {
    console.log('Nada foi apagado. Rode com --apply para executar.');
    if (grupoB.length > 0) {
      console.log('Para incluir o grupo B, acrescente --incluir-inalcancaveis.');
    }
    return;
  }

  const alvos = INCLUIR_INALCANCAVEIS ? [...grupoA, ...grupoB] : grupoA;

  if (alvos.length === 0) {
    console.log('Nada a apagar.');
    return;
  }

  const ids = alvos.map((t) => t.id);

  const [respostasApagadas, tentativasApagadas] = await prisma.$transaction([
    prisma.attemptAnswer.deleteMany({ where: { attemptId: { in: ids } } }),
    prisma.attempt.deleteMany({ where: { id: { in: ids } } }),
  ]);

  console.log(
    `Apagadas ${tentativasApagadas.count} tentativas e ${respostasApagadas.count} respostas associadas.`,
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
