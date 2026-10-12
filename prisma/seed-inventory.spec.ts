import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { seedBacklog } from './seed-backlog';
import { main } from './seed';
import {
  buildSeedInventory,
  FrontendQuestion,
  SimulationSeed,
  validateQuestions,
} from './seed-inventory';

jest.mock('@prisma/client', () => ({
  ...jest.requireActual<object>('@prisma/client'),
  PrismaClient: jest.fn(() => {
    throw new Error('Inventário não pode instanciar Prisma.');
  }),
}));

const validQuestion: FrontendQuestion = {
  id: 1,
  type: 'multiple_choice',
  text: 'Pergunta de teste',
  options: [
    { id: 'A', text: 'Primeira' },
    { id: 'B', text: 'Segunda' },
  ],
  correctAnswer: 'B',
  points: 1,
};
const validSeed: SimulationSeed = {
  file: 'questoes-teste.ts',
  exportName: 'questoesTeste',
  disciplineSlug: 'matematica',
  schoolYear: 1,
  bimester: 1,
  assessment: 'AV1',
  title: 'Simulado de teste',
  subtitle: '1º ano',
  estimatedDurationMinutes: 10,
};

function writeModule(
  dataDir: string,
  file: string,
  exportName: string,
  value: unknown,
): void {
  writeFileSync(
    join(dataDir, file),
    `export const ${exportName} = ${JSON.stringify(value)};`,
  );
}

describe('Inventário do seed', () => {
  let dataDir: string;
  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), 'seed-inventory-'));
  });
  afterEach(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  function build(
    overrides: Partial<Parameters<typeof buildSeedInventory>[0]> = {},
  ) {
    return buildSeedInventory({
      dataDir,
      simulations: [validSeed],
      disciplineSlugs: ['matematica', 'portugues'],
      turmaSlugs: ['turma-bernardo'],
      backlog: [],
      includeLegacyPortuguese: false,
      ...overrides,
    });
  }

  it('contabiliza apenas conteúdo publicável com arquivo/export válidos', () => {
    writeModule(dataDir, validSeed.file, validSeed.exportName, [validQuestion]);
    const { report, simulations } = build();
    expect(report.errors).toEqual([]);
    expect(report.totals).toMatchObject({
      importableFiles: 1,
      importableSimulations: 1,
      importableQuestions: 1,
      plannedSimulations: 0,
    });
    expect(simulations).toHaveLength(1);
    expect(JSON.stringify(report)).not.toContain('correctAnswer');
    expect(JSON.stringify(report)).not.toContain('Pergunta de teste');
  });

  it('bloqueia arquivo publicável ausente em vez de ignorá-lo', () => {
    const { report, simulations } = build();
    expect(report.errors).toContain(
      `${validSeed.file}: arquivo publicável ausente.`,
    );
    expect(simulations).toEqual([]);
  });

  it('bloqueia export inexistente e módulo com TypeScript inválido', () => {
    writeModule(dataDir, validSeed.file, 'outroExport', [validQuestion]);
    expect(
      build().report.errors.some((error) =>
        error.includes('nenhuma questão encontrada'),
      ),
    ).toBe(true);
    writeFileSync(join(dataDir, validSeed.file), 'export const x = {');
    expect(build().report.errors).toContain(
      `${validSeed.file}: falha ao carregar módulo de conteúdo.`,
    );
  });

  it('bloqueia export de conteúdo sem registro no mesmo módulo', () => {
    writeModule(dataDir, validSeed.file, validSeed.exportName, [validQuestion]);
    writeFileSync(
      join(dataDir, validSeed.file),
      `export const ${validSeed.exportName} = ${JSON.stringify([validQuestion])}; export const semRegistro = [];`,
    );
    expect(build().report.errors).toContain(
      `${validSeed.file}: export de conteúdo sem registro (semRegistro).`,
    );
  });

  it('exclui metadados inválidos dos totais publicáveis e da importação', () => {
    writeModule(dataDir, validSeed.file, validSeed.exportName, [validQuestion]);
    const { report, simulations } = build({
      simulations: [{ ...validSeed, disciplineSlug: 'desconhecida' }],
    });
    expect(report.entries[0].status).toBe('INVALID');
    expect(report.totals).toMatchObject({
      importableSimulations: 0,
      importableQuestions: 0,
      invalidSimulations: 1,
    });
    expect(simulations).toEqual([]);
  });

  it('mantém backlog rastreável e não o promove pela presença de um arquivo', () => {
    const backlog = [
      {
        file: validSeed.file,
        trackingId: 'editorial:teste',
        reason: 'Aguarda revisão.',
      },
    ];
    expect(build({ backlog }).report.errors).toEqual([]);
    writeModule(dataDir, validSeed.file, validSeed.exportName, [validQuestion]);
    const { report, simulations } = build({ backlog });
    expect(report.errors).toEqual([]);
    expect(report.entries[0]).toMatchObject({
      status: 'PLANNED',
      trackingId: 'editorial:teste',
      filePresent: true,
      questionCount: null,
    });
    expect(report.totals).toMatchObject({
      importableSimulations: 0,
      plannedSimulations: 1,
      plannedFilesPresent: 1,
    });
    expect(simulations).toEqual([]);
  });

  it('bloqueia backlog sem metadados, registros duplicados e arquivo órfão', () => {
    writeModule(dataDir, validSeed.file, validSeed.exportName, [validQuestion]);
    writeModule(dataDir, 'orfao.ts', 'orfao', [validQuestion]);
    const item = {
      file: 'ausente.ts',
      trackingId: 'editorial:ausente',
      reason: 'Aguarda revisão.',
    };
    const { report } = build({ backlog: [item, item] });
    expect(report.errors).toContain(
      'ausente.ts: backlog sem referência de simulado.',
    );
    expect(report.errors).toContain('ausente.ts: backlog duplicado.');
    expect(report.errors).toContain(
      'orfao.ts: arquivo sem registro no catálogo/backlog.',
    );
  });

  it('bloqueia slug/export duplicados e referências de disciplina/turma inválidas', () => {
    writeModule(dataDir, validSeed.file, validSeed.exportName, [validQuestion]);
    const { report } = build({
      simulations: [
        validSeed,
        {
          ...validSeed,
          disciplineSlug: 'nao-cadastrada',
          turmaSlug: 'privada-desconhecida',
        },
        validSeed,
      ],
    });
    expect(
      report.errors.some((error) =>
        error.includes('slug de simulado duplicado'),
      ),
    ).toBe(true);
    expect(report.errors).toContain(
      `${validSeed.file}: referência de export duplicada.`,
    );
    expect(report.errors).toContain(
      `${validSeed.file}: disciplina não cadastrada.`,
    );
    expect(report.errors).toContain(`${validSeed.file}: turma não cadastrada.`);
  });

  it('produz relatório determinístico independente da ordem dos registros', () => {
    writeModule(dataDir, validSeed.file, validSeed.exportName, [validQuestion]);
    const second = {
      ...validSeed,
      file: 'segunda.ts',
      exportName: 'segunda',
      assessment: 'AV2',
    };
    writeModule(dataDir, second.file, second.exportName, [validQuestion]);
    const first = build({ simulations: [validSeed, second] }).report;
    const reversed = build({ simulations: [second, validSeed] }).report;
    expect(JSON.stringify(first)).toBe(JSON.stringify(reversed));
  });

  it('valida e preserva as cinco atividades legadas de Português e sua turma', () => {
    const terceiro = {
      '1': { AV2: [validQuestion] },
      '2': { AV1: [validQuestion], AV2: [validQuestion] },
      '3': { AV1: [validQuestion], AV2: [validQuestion] },
    };
    writeModule(dataDir, 'questoes-portugues.ts', 'questoesPortugues', {
      terceiro,
    });
    const { report, simulations } = build({
      simulations: [],
      includeLegacyPortuguese: true,
    });
    expect(report.errors).toEqual([]);
    expect(report.totals).toMatchObject({
      importableFiles: 1,
      importableSimulations: 5,
      importableQuestions: 5,
    });
    expect(
      simulations.every(
        (simulation) =>
          simulation.turmaSlug === 'turma-bernardo' &&
          simulation.schoolYear === 3,
      ),
    ).toBe(true);
    writeModule(dataDir, 'questoes-portugues.ts', 'questoesPortugues', {
      terceiro: {},
    });
    expect(
      build({ simulations: [], includeLegacyPortuguese: true }).report.errors,
    ).toContain('questoes-portugues.ts: export legado terceiro ausente/vazio.');
  });

  it('rejeita referências fora do diretório de conteúdo', () => {
    expect(
      build({ simulations: [{ ...validSeed, file: '../fora.ts' }] }).report
        .errors,
    ).toContain('Referência de arquivo/export inválida.');
  });
});

describe('Contrato de questões para importação', () => {
  it('valida os quatro tipos existentes, incluindo classificação com respostas textuais legadas', () => {
    const items = [
      { id: '1', text: 'Item um' },
      { id: '2', text: 'Item dois' },
    ];
    const common = { id: 1, text: 'Questão' };
    const questions: unknown[] = [
      validQuestion,
      {
        ...common,
        id: 2,
        type: 'true_false_multiple',
        items,
        correctAnswer: { '1': 'V', '2': 'F' },
      },
      {
        ...common,
        id: 3,
        type: 'classification',
        items,
        correctAnswer: { '1': 'C', '2': 'P' },
      },
      {
        ...common,
        id: 4,
        type: 'classification',
        items,
        correctAnswer: { '1': 'texto um', '2': 'texto dois' },
      },
      {
        ...common,
        id: 5,
        type: 'matching',
        pairs: items.map((left) => ({
          left,
          right: [{ id: 'A', text: 'Direita' }],
        })),
        correctAnswer: { '1': 'A', '2': 'A' },
      },
    ];
    expect(validateQuestions('fixture', questions)).toEqual([]);
  });

  it.each([
    { ...validQuestion, type: 'nao-existe' },
    { ...validQuestion, correctAnswer: 'nao-existe' },
    {
      ...validQuestion,
      options: [validQuestion.options![0], validQuestion.options![0]],
    },
    { ...validQuestion, points: 0 },
    { ...validQuestion, text: '' },
    {
      ...validQuestion,
      type: 'true_false_multiple',
      items: [{ id: '1', text: 'Um' }],
      correctAnswer: {},
    },
    {
      ...validQuestion,
      type: 'true_false_multiple',
      items: [{ id: '1', text: 'Um' }],
      correctAnswer: { '1': 'X' },
    },
    {
      ...validQuestion,
      type: 'classification',
      items: [{ id: '1', text: 'Um' }],
      correctAnswer: { '1': '' },
    },
    {
      ...validQuestion,
      type: 'matching',
      pairs: [
        {
          left: { id: '1', text: 'Um' },
          right: [{ id: 'A', text: 'Direita' }],
        },
      ],
      correctAnswer: { '1': 'B' },
    },
  ])(
    'bloqueia questões inconsistentes sem expor conteúdo no diagnóstico',
    (question) => {
      const errors = validateQuestions('fixture', [question]);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.every((error) => !error.includes('Pergunta de teste')),
      ).toBe(true);
    },
  );

  it('bloqueia ordens que colidiriam no upsert do banco', () => {
    expect(
      validateQuestions('fixture', [validQuestion, validQuestion]).some(
        (error) => error.includes('ordem/id de questão duplicado'),
      ),
    ).toBe(true);
  });
});

describe('Dry-run do acervo rastreado', () => {
  it('não instancia Prisma nem usa DATABASE_URL; o backlog mantém 192 referências explícitas', async () => {
    const savedEnv = {
      dry: process.env.SEED_DRY_RUN,
      inventory: process.env.SEED_INVENTORY,
      database: process.env.DATABASE_URL,
    };
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      process.env.SEED_DRY_RUN = 'true';
      delete process.env.SEED_INVENTORY;
      process.env.DATABASE_URL =
        'postgresql://invalid:invalid@127.0.0.1:1/not-used';
      await main();
      expect(PrismaClient).not.toHaveBeenCalled();
      expect(seedBacklog).toHaveLength(192);
      expect(new Set(seedBacklog.map((entry) => entry.file)).size).toBe(192);
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('simulados não importados'),
      );
    } finally {
      for (const [key, value] of Object.entries({
        SEED_DRY_RUN: savedEnv.dry,
        SEED_INVENTORY: savedEnv.inventory,
        DATABASE_URL: savedEnv.database,
      })) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      log.mockRestore();
    }
  });
});
