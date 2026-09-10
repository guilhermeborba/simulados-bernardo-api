import { Injectable } from '@nestjs/common';
import { AttemptStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TurmasService } from '../turmas/turmas.service';
import { RequestUser } from '../students/student-access.service';

/**
 * Quantos simulados o aluno precisa ter feito para entrar no ranking.
 *
 * A média de acerto sozinha premiaria quem faz um único simulado fácil e para
 * de jogar: 100% de um simulado passa à frente de 95% de vinte. O mínimo tira
 * essa jogada da mesa sem mudar a régua para quem está estudando de verdade.
 */
export const MINIMO_DE_SIMULADOS_PARA_RANKING = 5;

const FUSO_DA_ESCOLA = 'America/Sao_Paulo';

export interface LinhaDoRanking {
  posicao: number;
  nome: string;
  media: number;
  simulados: number;
  ehVoce: boolean;
}

@Injectable()
export class PontuacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly turmasService: TurmasService,
  ) {}

  async getMinhaPontuacao(userId: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: { studentId: userId, status: AttemptStatus.FINISHED },
      select: {
        simulationId: true,
        percentage: true,
        finishedAt: true,
        simulation: { select: { title: true, discipline: { select: { name: true } } } },
      },
    });

    const melhores = this.melhorTentativaPorSimulado(attempts);

    const melhorDeTodos = [...melhores.values()].reduce<
      { percentage: number; titulo: string; disciplina: string } | null
    >((melhor, atual) => {
      if (!melhor || atual.percentage > melhor.percentage) {
        return {
          percentage: atual.percentage,
          titulo: atual.simulation.title,
          disciplina: atual.simulation.discipline.name,
        };
      }
      return melhor;
    }, null);

    return {
      media: this.media([...melhores.values()].map((item) => item.percentage)),
      simulados: melhores.size,
      diasSeguidos: this.diasSeguidos(
        attempts.map((attempt) => attempt.finishedAt),
      ),
      melhorSimulado: melhorDeTodos,
    };
  }

  /**
   * Ranking de uma turma, contando apenas os simulados da própria turma — o
   * placar da sala não deve se mexer porque alguém fez um simulado de curso
   * técnico por curiosidade.
   */
  async getRankingDaTurma(turmaId: string, user: RequestUser) {
    await this.turmasService.assertCanAccessTurma(turmaId, user);

    const turma = await this.prisma.turma.findFirst({
      where: { id: turmaId, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!turma) {
      return null;
    }

    const attempts = await this.prisma.attempt.findMany({
      where: {
        status: AttemptStatus.FINISHED,
        simulation: { turmaId },
        student: { turmaMemberships: { some: { turmaId } } },
      },
      select: {
        studentId: true,
        simulationId: true,
        percentage: true,
        student: { select: { name: true } },
      },
    });

    const porAluno = new Map<
      string,
      { nome: string; melhores: Map<string, number> }
    >();

    attempts.forEach((attempt) => {
      const aluno = porAluno.get(attempt.studentId) ?? {
        nome: attempt.student.name,
        melhores: new Map<string, number>(),
      };
      const percentual = this.paraNumero(attempt.percentage);
      const anterior = aluno.melhores.get(attempt.simulationId);

      if (anterior === undefined || percentual > anterior) {
        aluno.melhores.set(attempt.simulationId, percentual);
      }

      porAluno.set(attempt.studentId, aluno);
    });

    const classificados = [...porAluno.entries()]
      .map(([studentId, aluno]) => ({
        studentId,
        nome: this.nomeCurto(aluno.nome),
        media: this.media([...aluno.melhores.values()]),
        simulados: aluno.melhores.size,
      }))
      .filter((aluno) => aluno.simulados >= MINIMO_DE_SIMULADOS_PARA_RANKING)
      // Empate na média é desempatado por quem fez mais simulados: entre duas
      // médias iguais, quem se expôs a mais conteúdo fez mais.
      .sort((a, b) => b.media - a.media || b.simulados - a.simulados)
      .map((aluno, indice) => ({
        posicao: indice + 1,
        nome: aluno.nome,
        media: aluno.media,
        simulados: aluno.simulados,
        ehVoce: aluno.studentId === user.id,
      }));

    const minhaPosicao = classificados.find((linha) => linha.ehVoce) ?? null;

    // Quanto falta é contado aqui, e não na pontuação pessoal, porque o corte
    // é sobre os simulados desta turma. Fora daqui, um aluno que fez cinco
    // simulados de curso técnico leria "faltam 0" e mesmo assim não apareceria
    // no ranking da sala.
    const meusSimuladosNaTurma =
      porAluno.get(user.id)?.melhores.size ?? 0;

    return {
      turma,
      totalClassificados: classificados.length,
      minimoDeSimulados: MINIMO_DE_SIMULADOS_PARA_RANKING,
      meusSimuladosNaTurma,
      faltamParaORanking: Math.max(
        0,
        MINIMO_DE_SIMULADOS_PARA_RANKING - meusSimuladosNaTurma,
      ),
      minhaPosicao,
      podio: classificados.slice(0, 3),
      // Só os vizinhos, não a lista inteira: ninguém precisa ver todo dia
      // quantas pessoas estão à sua frente.
      vizinhanca: this.vizinhanca(classificados, minhaPosicao?.posicao ?? null),
      podioAte: Math.min(3, classificados.length),
    };
  }

  private vizinhanca(
    classificados: LinhaDoRanking[],
    posicao: number | null,
  ): LinhaDoRanking[] {
    if (posicao === null) {
      return [];
    }

    const indice = posicao - 1;
    return (
      classificados
        .slice(Math.max(0, indice - 2), indice + 3)
        // Quem já aparece no pódio não se repete logo abaixo: para quem está
        // em 4º, "perto de você" mostrando o 2º e o 3º de novo é ruído.
        .filter((linha) => linha.posicao > 3)
    );
  }

  private melhorTentativaPorSimulado<
    T extends { simulationId: string; percentage: Prisma.Decimal | null },
  >(attempts: T[]): Map<string, T & { percentage: number }> {
    const melhores = new Map<string, T & { percentage: number }>();

    attempts.forEach((attempt) => {
      const percentual = this.paraNumero(attempt.percentage);
      const anterior = melhores.get(attempt.simulationId);

      if (!anterior || percentual > anterior.percentage) {
        melhores.set(attempt.simulationId, {
          ...attempt,
          percentage: percentual,
        });
      }
    });

    return melhores;
  }

  /**
   * Dias consecutivos com pelo menos um simulado terminado, contando de hoje
   * para trás. Um dia de folga zera — mas o dia corrente ainda não conta como
   * quebra, senão o selo zeraria toda madrugada.
   */
  private diasSeguidos(datas: (Date | null)[]): number {
    const dias = new Set(
      datas
        .filter((data): data is Date => data !== null)
        .map((data) => this.diaNaEscola(data)),
    );

    if (dias.size === 0) {
      return 0;
    }

    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);

    let cursor = dias.has(this.diaNaEscola(hoje))
      ? hoje
      : dias.has(this.diaNaEscola(ontem))
        ? ontem
        : null;

    if (cursor === null) {
      return 0;
    }

    let total = 0;
    while (dias.has(this.diaNaEscola(cursor))) {
      total += 1;
      cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
    }

    return total;
  }

  /** AAAA-MM-DD no fuso da escola, para o dia virar à meia-noite daqui. */
  private diaNaEscola(data: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: FUSO_DA_ESCOLA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(data);
  }

  /** "Bernardo Borba" vira "Bernardo B." — é a sala do filho, não um cadastro. */
  private nomeCurto(nome: string): string {
    const partes = nome.trim().split(/\s+/);

    if (partes.length === 1) {
      return partes[0];
    }

    return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
  }

  private media(valores: number[]): number {
    if (valores.length === 0) {
      return 0;
    }

    const soma = valores.reduce((total, valor) => total + valor, 0);
    return Math.round((soma / valores.length) * 10) / 10;
  }

  private paraNumero(valor: Prisma.Decimal | null): number {
    return valor ? Number(valor) : 0;
  }
}
