import { Test } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TurmasService } from '../turmas/turmas.service';
import { PontuacaoService } from './pontuacao.service';

function dec(valor: number) {
  return new Prisma.Decimal(valor);
}

/** Data a N dias atrás, ao meio-dia, para não esbarrar na virada do fuso. */
function diasAtras(dias: number): Date {
  const data = new Date();
  data.setHours(12, 0, 0, 0);
  return new Date(data.getTime() - dias * 24 * 60 * 60 * 1000);
}

const simulacao = {
  title: 'Simulado AV1 — Matemática',
  discipline: { name: 'Matemática' },
};

describe('PontuacaoService', () => {
  let service: PontuacaoService;
  let prisma: {
    attempt: { findMany: jest.Mock };
    turma: { findFirst: jest.Mock };
  };
  let turmas: { assertCanAccessTurma: jest.Mock };

  const aluno = { id: 'aluno-1', role: UserRole.STUDENT };

  beforeEach(async () => {
    prisma = {
      attempt: { findMany: jest.fn().mockResolvedValue([]) },
      turma: {
        findFirst: jest.fn().mockResolvedValue({ id: 'turma-1', name: '3º ano' }),
      },
    };
    turmas = { assertCanAccessTurma: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PontuacaoService,
        { provide: PrismaService, useValue: prisma },
        { provide: TurmasService, useValue: turmas },
      ],
    }).compile();

    service = moduleRef.get(PontuacaoService);
  });

  describe('minha pontuação', () => {
    it('usa a melhor tentativa de cada simulado, não a média de todas', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        { simulationId: 's1', percentage: dec(40), finishedAt: diasAtras(0), simulation: simulacao },
        { simulationId: 's1', percentage: dec(90), finishedAt: diasAtras(0), simulation: simulacao },
        { simulationId: 's2', percentage: dec(70), finishedAt: diasAtras(0), simulation: simulacao },
      ]);

      const resultado = await service.getMinhaPontuacao('aluno-1');

      // (90 + 70) / 2, e não (40 + 90 + 70) / 3
      expect(resultado.media).toBe(80);
      expect(resultado.simulados).toBe(2);
    });

  });

  describe('dias seguidos', () => {
    it('conta dias consecutivos terminando hoje', async () => {
      prisma.attempt.findMany.mockResolvedValue(
        [0, 1, 2].map((dias) => ({
          simulationId: `s${dias}`,
          percentage: dec(80),
          finishedAt: diasAtras(dias),
          simulation: simulacao,
        })),
      );

      const resultado = await service.getMinhaPontuacao('aluno-1');

      expect(resultado.diasSeguidos).toBe(3);
    });

    it('não zera quando o aluno estudou ontem mas ainda não hoje', async () => {
      prisma.attempt.findMany.mockResolvedValue(
        [1, 2].map((dias) => ({
          simulationId: `s${dias}`,
          percentage: dec(80),
          finishedAt: diasAtras(dias),
          simulation: simulacao,
        })),
      );

      const resultado = await service.getMinhaPontuacao('aluno-1');

      expect(resultado.diasSeguidos).toBe(2);
    });

    it('zera depois de um dia de folga', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        { simulationId: 's1', percentage: dec(80), finishedAt: diasAtras(3), simulation: simulacao },
        { simulationId: 's2', percentage: dec(80), finishedAt: diasAtras(4), simulation: simulacao },
      ]);

      const resultado = await service.getMinhaPontuacao('aluno-1');

      expect(resultado.diasSeguidos).toBe(0);
    });

    it('não conta duas vezes o mesmo dia', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        { simulationId: 's1', percentage: dec(80), finishedAt: diasAtras(0), simulation: simulacao },
        { simulationId: 's2', percentage: dec(80), finishedAt: diasAtras(0), simulation: simulacao },
      ]);

      const resultado = await service.getMinhaPontuacao('aluno-1');

      expect(resultado.diasSeguidos).toBe(1);
    });
  });

  describe('ranking da turma', () => {
    function tentativasDe(
      studentId: string,
      nome: string,
      percentuais: number[],
    ) {
      return percentuais.map((percentual, indice) => ({
        studentId,
        simulationId: `s${indice}`,
        percentage: dec(percentual),
        student: { name: nome },
      }));
    }

    it('exige o mínimo de simulados para entrar na lista', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        ...tentativasDe('aluno-1', 'Bernardo Borba', [90, 90, 90, 90, 90]),
        // 100% de média, mas com um simulado só: não classifica.
        ...tentativasDe('aluno-2', 'Atalho Silva', [100]),
      ]);

      const resultado = await service.getRankingDaTurma('turma-1', aluno);

      expect(resultado?.totalClassificados).toBe(1);
      expect(resultado?.podio.map((linha) => linha.nome)).toEqual(['Bernardo B.']);
    });

    it('desempata média igual por quem fez mais simulados', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        ...tentativasDe('aluno-1', 'Bernardo Borba', [80, 80, 80, 80, 80]),
        ...tentativasDe('aluno-2', 'Laura Martins', [80, 80, 80, 80, 80, 80]),
      ]);

      const resultado = await service.getRankingDaTurma('turma-1', aluno);

      expect(resultado?.podio.map((linha) => linha.nome)).toEqual([
        'Laura M.',
        'Bernardo B.',
      ]);
    });

    it('marca a linha do próprio aluno e devolve a posição dele', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        ...tentativasDe('aluno-9', 'Laura Martins', [95, 95, 95, 95, 95]),
        ...tentativasDe('aluno-1', 'Bernardo Borba', [80, 80, 80, 80, 80]),
      ]);

      const resultado = await service.getRankingDaTurma('turma-1', aluno);

      expect(resultado?.minhaPosicao).toMatchObject({
        posicao: 2,
        nome: 'Bernardo B.',
        ehVoce: true,
      });
    });

    it('conta o que falta usando só os simulados da turma', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        ...tentativasDe('aluno-9', 'Laura Martins', [95, 95, 95, 95, 95]),
        ...tentativasDe('aluno-1', 'Bernardo Borba', [80, 80]),
      ]);

      const resultado = await service.getRankingDaTurma('turma-1', aluno);

      expect(resultado?.meusSimuladosNaTurma).toBe(2);
      expect(resultado?.faltamParaORanking).toBe(3);
    });

    it('não repete na vizinhança quem já está no pódio', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        ...tentativasDe('a1', 'Laura Martins', [99, 99, 99, 99, 99]),
        ...tentativasDe('a2', 'Pedro Almeida', [95, 95, 95, 95, 95]),
        ...tentativasDe('a3', 'Sofia Ramos', [90, 90, 90, 90, 90]),
        ...tentativasDe('aluno-1', 'Bernardo Borba', [85, 85, 85, 85, 85]),
        ...tentativasDe('a5', 'Caio Nunes', [80, 80, 80, 80, 80]),
      ]);

      const resultado = await service.getRankingDaTurma('turma-1', aluno);

      expect(resultado?.minhaPosicao?.posicao).toBe(4);
      expect(resultado?.vizinhanca.map((linha) => linha.posicao)).toEqual([4, 5]);
    });

    it('deixa a vizinhança vazia para quem ainda não classificou', async () => {
      prisma.attempt.findMany.mockResolvedValue([
        ...tentativasDe('aluno-9', 'Laura Martins', [95, 95, 95, 95, 95]),
        ...tentativasDe('aluno-1', 'Bernardo Borba', [80, 80]),
      ]);

      const resultado = await service.getRankingDaTurma('turma-1', aluno);

      expect(resultado?.minhaPosicao).toBeNull();
      expect(resultado?.vizinhanca).toEqual([]);
    });

    it('recusa o ranking de uma turma que o aluno não integra', async () => {
      turmas.assertCanAccessTurma.mockRejectedValue(new Error('sem acesso'));

      await expect(
        service.getRankingDaTurma('turma-de-outro', aluno),
      ).rejects.toThrow();
      expect(prisma.attempt.findMany).not.toHaveBeenCalled();
    });
  });
});
