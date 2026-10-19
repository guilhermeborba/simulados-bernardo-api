import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { Script, createContext } from 'node:vm';
import * as ts from 'typescript';
import { slugify } from '../src/common/utils/slugify';
import { SeedBacklogEntry } from './seed-backlog';

export interface FrontendOption {
  id: string | number;
  text: string;
}

export interface FrontendPair {
  left: FrontendOption;
  right: FrontendOption[];
}

/** Mesmo limite de CreateQuestionDto.theme. */
export const THEME_MAX_LENGTH = 120;

export interface FrontendQuestion {
  id: string | number;
  type:
    'multiple_choice' | 'true_false_multiple' | 'matching' | 'classification';
  text: string;
  options?: FrontendOption[];
  items?: FrontendOption[];
  pairs?: FrontendPair[];
  correctAnswer: string | Record<string, string>;
  tip?: string;
  funFact?: string;
  /** Assunto da questão, usado no resultado por tema. Ver docs/temas-editoriais.md. */
  theme?: string;
  points?: number;
}

export interface SimulationSeed {
  file: string;
  exportName: string;
  disciplineSlug: string;
  schoolYear: number;
  bimester: number;
  assessment: string;
  title: string;
  subtitle: string;
  estimatedDurationMinutes: number;
  slug?: string;
  topic?: string;
  turmaSlug?: string;
}

export interface NormalizedSimulationSeed extends Omit<
  SimulationSeed,
  'file' | 'exportName'
> {
  questions: FrontendQuestion[];
}

export interface InventoryEntry {
  slug: string;
  file: string;
  exportName: string;
  disciplineSlug: string;
  schoolYear: number;
  bimester: number;
  assessment: string;
  turmaSlug: string | null;
  status: 'IMPORTABLE' | 'PLANNED' | 'INVALID';
  filePresent: boolean;
  questionCount: number | null;
  themedQuestionCount: number | null;
  trackingId?: string;
  reason?: string;
}

export interface InventoryReport {
  schemaVersion: 1;
  totals: {
    disciplines: number;
    dataFiles: number;
    importableFiles: number;
    importableSimulations: number;
    importableQuestions: number;
    importableThemedQuestions: number;
    fullyThemedSimulations: number;
    plannedSimulations: number;
    plannedFilesPresent: number;
    invalidSimulations: number;
  };
  bySchoolYear: Array<{
    schoolYear: number;
    importableSimulations: number;
    importableQuestions: number;
    importableThemedQuestions: number;
    plannedSimulations: number;
  }>;
  entries: InventoryEntry[];
  errors: string[];
}

interface InventoryConfig {
  dataDir: string;
  simulations: SimulationSeed[];
  disciplineSlugs: string[];
  turmaSlugs: string[];
  backlog: SeedBacklogEntry[];
  includeLegacyPortuguese?: boolean;
}

const legacyFile = 'questoes-portugues.ts';
const legacyExport = 'questoesPortugues';

export function getSimulationSlug(
  simulation: Pick<
    SimulationSeed,
    'disciplineSlug' | 'schoolYear' | 'bimester' | 'assessment'
  >,
): string {
  return slugify(
    `${simulation.disciplineSlug}-${simulation.schoolYear}-ano-${simulation.bimester}-bimestre-${simulation.assessment}`,
  );
}

export function getQuestionOrder(
  question: FrontendQuestion,
  index: number,
): number {
  const id = Number(question.id);
  return Number.isInteger(id) && id > 0 ? id : index + 1;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function optionKeys(value: unknown, label: string, errors: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label}: alternativas/itens ausentes.`);
    return [];
  }
  const keys: string[] = [];
  value.forEach((option: unknown, index: number) => {
    if (
      !isObject(option) ||
      !['string', 'number'].includes(typeof option.id) ||
      !hasText(String(option.id ?? '')) ||
      !hasText(option.text)
    ) {
      errors.push(`${label}: alternativa/item ${index + 1} inválido.`);
      return;
    }
    const key = String(option.id);
    if (keys.includes(key))
      errors.push(`${label}: chave de alternativa/item duplicada.`);
    keys.push(key);
  });
  return keys;
}

/** Valida o contrato realmente importado, sem imprimir enunciados ou gabaritos. */
export function validateQuestions(source: string, value: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(value) || value.length === 0)
    return [`${source}: nenhuma questão encontrada no export.`];
  const orders = new Set<number>();
  value.forEach((question: unknown, index: number) => {
    const label = `${source}: questão ${index + 1}`;
    if (!isObject(question)) {
      errors.push(`${label}: formato inválido.`);
      return;
    }
    if (
      !['string', 'number'].includes(typeof question.id) ||
      !hasText(String(question.id ?? ''))
    )
      errors.push(`${label}: id inválido.`);
    if (!hasText(question.text)) errors.push(`${label}: enunciado vazio.`);
    if (
      question.points !== undefined &&
      (typeof question.points !== 'number' ||
        !Number.isFinite(question.points) ||
        question.points <= 0)
    )
      errors.push(`${label}: pontuação inválida.`);
    for (const field of ['tip', 'funFact']) {
      if (question[field] !== undefined && typeof question[field] !== 'string')
        errors.push(`${label}: ${field} inválido.`);
    }
    if (
      question.theme !== undefined &&
      (typeof question.theme !== 'string' ||
        !hasText(question.theme) ||
        question.theme.trim().length > THEME_MAX_LENGTH)
    )
      errors.push(
        `${label}: tema deve ser um texto de 1 a ${THEME_MAX_LENGTH} caracteres.`,
      );
    const order = getQuestionOrder(
      question as unknown as FrontendQuestion,
      index,
    );
    if (orders.has(order))
      errors.push(`${label}: ordem/id de questão duplicado.`);
    orders.add(order);
    if (question.type === 'multiple_choice') {
      const keys = optionKeys(question.options, label, errors);
      if (keys.length < 2)
        errors.push(
          `${label}: múltipla escolha exige pelo menos duas alternativas.`,
        );
      if (
        !hasText(question.correctAnswer) ||
        !keys.includes(question.correctAnswer)
      )
        errors.push(`${label}: gabarito não corresponde a uma alternativa.`);
      return;
    }
    let keys: string[];
    let allowedByKey: Map<string, string[]> | undefined;
    if (
      question.type === 'true_false_multiple' ||
      question.type === 'classification'
    ) {
      keys = optionKeys(question.items, label, errors);
    } else if (question.type === 'matching') {
      keys = [];
      allowedByKey = new Map();
      if (!Array.isArray(question.pairs) || question.pairs.length === 0)
        errors.push(`${label}: associação sem pares.`);
      const rightText = new Map<string, string>();
      for (const pair of Array.isArray(question.pairs) ? question.pairs : []) {
        if (!isObject(pair)) {
          errors.push(`${label}: par inválido.`);
          continue;
        }
        const left = optionKeys([pair.left], label, errors);
        const right = optionKeys(pair.right, label, errors);
        if (left[0]) {
          if (keys.includes(left[0]))
            errors.push(`${label}: chave esquerda duplicada.`);
          keys.push(left[0]);
          allowedByKey.set(left[0], right);
        }
        for (const option of Array.isArray(pair.right) ? pair.right : []) {
          if (!isObject(option)) continue;
          const key = String(option.id);
          if (rightText.has(key) && rightText.get(key) !== option.text)
            errors.push(`${label}: chave direita possui textos conflitantes.`);
          rightText.set(key, String(option.text));
        }
      }
    } else {
      errors.push(`${label}: tipo de questão desconhecido.`);
      return;
    }
    if (!isObject(question.correctAnswer)) {
      errors.push(`${label}: gabarito deve mapear todos os itens.`);
      return;
    }
    const answers = question.correctAnswer;
    if (
      Object.keys(answers).length !== keys.length ||
      keys.some((key) => !Object.prototype.hasOwnProperty.call(answers, key))
    )
      errors.push(`${label}: gabarito incompleto ou contém chaves extras.`);
    for (const [key, answer] of Object.entries(answers)) {
      if (!hasText(answer))
        errors.push(`${label}: valor de gabarito inválido.`);
      else if (
        question.type === 'true_false_multiple' &&
        !['V', 'F'].includes(answer)
      )
        errors.push(`${label}: gabarito V/F inválido.`);
      else if (allowedByKey && !allowedByKey.get(key)?.includes(answer))
        errors.push(
          `${label}: associação aponta para alternativa inexistente.`,
        );
    }
  });
  return errors;
}

function loadDataModule(
  dataDir: string,
  file: string,
): Record<string, unknown> {
  const filePath = join(dataDir, file);
  const source = readFileSync(filePath, 'utf8').replace(/^import .+;$/gm, '');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: basename(filePath),
    reportDiagnostics: true,
  });
  if (
    transpiled.diagnostics?.some(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
    )
  )
    throw new Error('TypeScript inválido.');
  const exportsObject: Record<string, unknown> = {};
  const context = createContext({
    exports: exportsObject,
    module: { exports: exportsObject },
    require,
  });
  new Script(transpiled.outputText, { filename: filePath }).runInContext(
    context,
    { timeout: 1000 },
  );
  return exportsObject;
}

/** Não instancia Prisma nem conecta ao banco, inclusive se DATABASE_URL estiver definida. */
export function buildSeedInventory(config: InventoryConfig): {
  report: InventoryReport;
  simulations: NormalizedSimulationSeed[];
} {
  const errors: string[] = [];
  const entries: InventoryEntry[] = [];
  const normalized: NormalizedSimulationSeed[] = [];
  const backlogByFile = new Map<string, SeedBacklogEntry>();
  const seenTracking = new Set<string>();
  for (const entry of config.backlog) {
    if (backlogByFile.has(entry.file))
      errors.push(`${entry.file}: backlog duplicado.`);
    if (
      !hasText(entry.trackingId) ||
      seenTracking.has(entry.trackingId) ||
      !hasText(entry.reason)
    )
      errors.push(`${entry.file}: rastreamento/motivo do backlog inválido.`);
    backlogByFile.set(entry.file, entry);
    seenTracking.add(entry.trackingId);
  }
  const referencedFiles = new Set<string>();
  const moduleCache = new Map<string, Record<string, unknown>>();
  const expectedExports = new Map<string, Set<string>>();
  const seenSlugs = new Set<string>();
  const seenExports = new Set<string>();
  const diskFiles = existsSync(config.dataDir)
    ? readdirSync(config.dataDir)
        .filter((file) => file.endsWith('.ts'))
        .sort()
    : [];
  if (!existsSync(config.dataDir))
    errors.push('Diretório de seed-data inexistente.');
  const load = (file: string): Record<string, unknown> | undefined => {
    if (moduleCache.has(file)) return moduleCache.get(file);
    try {
      const result = loadDataModule(config.dataDir, file);
      moduleCache.set(file, result);
      return result;
    } catch {
      errors.push(`${file}: falha ao carregar módulo de conteúdo.`);
      return undefined;
    }
  };
  const append = (seed: SimulationSeed, questions?: unknown): void => {
    const errorsBeforeEntry = errors.length;
    const slug = seed.slug ?? getSimulationSlug(seed);
    if (seenSlugs.has(slug))
      errors.push(`${seed.file}: slug de simulado duplicado (${slug}).`);
    seenSlugs.add(slug);
    if (!config.disciplineSlugs.includes(seed.disciplineSlug))
      errors.push(`${seed.file}: disciplina não cadastrada.`);
    if (seed.turmaSlug && !config.turmaSlugs.includes(seed.turmaSlug))
      errors.push(`${seed.file}: turma não cadastrada.`);
    if (
      !Number.isInteger(seed.schoolYear) ||
      seed.schoolYear < -2 ||
      seed.schoolYear > 12 ||
      !Number.isInteger(seed.bimester) ||
      seed.bimester < 0 ||
      seed.bimester > 4 ||
      !hasText(seed.assessment) ||
      !hasText(seed.title) ||
      !hasText(seed.subtitle) ||
      !Number.isInteger(seed.estimatedDurationMinutes) ||
      seed.estimatedDurationMinutes <= 0
    )
      errors.push(`${seed.file}: metadados do simulado inválidos.`);
    const backlog = backlogByFile.get(seed.file);
    const present = existsSync(join(config.dataDir, seed.file));
    const entry: InventoryEntry = {
      slug,
      file: seed.file,
      exportName: seed.exportName,
      disciplineSlug: seed.disciplineSlug,
      schoolYear: seed.schoolYear,
      bimester: seed.bimester,
      assessment: seed.assessment,
      turmaSlug: seed.turmaSlug ?? null,
      status: backlog ? 'PLANNED' : 'IMPORTABLE',
      filePresent: present,
      questionCount: null,
      themedQuestionCount: null,
      ...(backlog
        ? { trackingId: backlog.trackingId, reason: backlog.reason }
        : {}),
    };
    entries.push(entry);
    if (errors.length > errorsBeforeEntry) entry.status = 'INVALID';
    if (backlog) return;
    if (!present) {
      errors.push(`${seed.file}: arquivo publicável ausente.`);
      entry.status = 'INVALID';
      return;
    }
    const questionErrors = validateQuestions(
      `${seed.file} (${seed.exportName})`,
      questions,
    );
    errors.push(...questionErrors);
    if (questionErrors.length > 0) entry.status = 'INVALID';
    if (entry.status === 'IMPORTABLE') {
      entry.questionCount = (questions as FrontendQuestion[]).length;
      entry.themedQuestionCount = (questions as FrontendQuestion[]).filter(
        (question) => question.theme !== undefined,
      ).length;
      normalized.push({ ...seed, questions: questions as FrontendQuestion[] });
    }
  };
  for (const seed of config.simulations) {
    if (
      basename(seed.file) !== seed.file ||
      !seed.file.endsWith('.ts') ||
      !hasText(seed.exportName)
    ) {
      errors.push('Referência de arquivo/export inválida.');
      continue;
    }
    referencedFiles.add(seed.file);
    const fileExports = expectedExports.get(seed.file) ?? new Set<string>();
    fileExports.add(seed.exportName);
    expectedExports.set(seed.file, fileExports);
    const identity = `${seed.file}:${seed.exportName}`;
    if (seenExports.has(identity))
      errors.push(`${seed.file}: referência de export duplicada.`);
    seenExports.add(identity);
    const data =
      backlogByFile.has(seed.file) ||
      !existsSync(join(config.dataDir, seed.file))
        ? undefined
        : load(seed.file);
    append(seed, data?.[seed.exportName]);
  }
  if (config.includeLegacyPortuguese !== false) {
    referencedFiles.add(legacyFile);
    expectedExports.set(legacyFile, new Set([legacyExport]));
    const data = load(legacyFile)?.[legacyExport];
    const terceiro =
      isObject(data) && isObject(data.terceiro) ? data.terceiro : undefined;
    if (!terceiro || Object.keys(terceiro).length === 0)
      errors.push(`${legacyFile}: export legado terceiro ausente/vazio.`);
    for (const [bimester, assessments] of Object.entries(terceiro ?? {})) {
      if (!isObject(assessments) || Object.keys(assessments).length === 0) {
        errors.push(`${legacyFile}: avaliações do legado inválidas.`);
        continue;
      }
      for (const [assessment, questions] of Object.entries(assessments)) {
        append(
          {
            file: legacyFile,
            exportName: `${legacyExport}.terceiro.${bimester}.${assessment}`,
            disciplineSlug: 'portugues',
            schoolYear: 3,
            turmaSlug: 'turma-bernardo',
            bimester: Number(bimester),
            assessment,
            title: `Simulado de Português - ${bimester}º Bimestre ${assessment}`,
            subtitle: `${bimester}º Bimestre — 3º Ano`,
            estimatedDurationMinutes: 45,
          },
          questions,
        );
      }
    }
  }
  for (const [file, exports] of moduleCache) {
    for (const name of Object.keys(exports)) {
      if (!expectedExports.get(file)?.has(name)) {
        errors.push(`${file}: export de conteúdo sem registro (${name}).`);
      }
    }
  }
  for (const entry of config.backlog)
    if (!referencedFiles.has(entry.file))
      errors.push(`${entry.file}: backlog sem referência de simulado.`);
  for (const file of diskFiles)
    if (!referencedFiles.has(file))
      errors.push(`${file}: arquivo sem registro no catálogo/backlog.`);
  entries.sort((a, b) =>
    a.slug < b.slug
      ? -1
      : a.slug > b.slug
        ? 1
        : a.file < b.file
          ? -1
          : a.file > b.file
            ? 1
            : 0,
  );
  normalized.sort((a, b) =>
    (a.slug ?? getSimulationSlug(a)).localeCompare(
      b.slug ?? getSimulationSlug(b),
      'en',
    ),
  );
  const imported = entries.filter(
    (entry) => entry.status === 'IMPORTABLE' && entry.questionCount !== null,
  );
  const planned = entries.filter((entry) => entry.status === 'PLANNED');
  const years = Array.from(
    new Set(entries.map((entry) => entry.schoolYear)),
  ).sort((a, b) => a - b);
  return {
    simulations: normalized,
    report: {
      schemaVersion: 1,
      totals: {
        disciplines: config.disciplineSlugs.length,
        dataFiles: diskFiles.length,
        importableFiles: new Set(imported.map((entry) => entry.file)).size,
        importableSimulations: imported.length,
        importableQuestions: imported.reduce(
          (total, entry) => total + (entry.questionCount ?? 0),
          0,
        ),
        importableThemedQuestions: imported.reduce(
          (total, entry) => total + (entry.themedQuestionCount ?? 0),
          0,
        ),
        fullyThemedSimulations: imported.filter(
          (entry) =>
            (entry.questionCount ?? 0) > 0 &&
            entry.themedQuestionCount === entry.questionCount,
        ).length,
        plannedSimulations: planned.length,
        plannedFilesPresent: planned.filter((entry) => entry.filePresent)
          .length,
        invalidSimulations: entries.filter(
          (entry) => entry.status === 'INVALID',
        ).length,
      },
      bySchoolYear: years.map((schoolYear) => {
        const current = entries.filter(
          (entry) => entry.schoolYear === schoolYear,
        );
        return {
          schoolYear,
          importableSimulations: current.filter(
            (entry) =>
              entry.status === 'IMPORTABLE' && entry.questionCount !== null,
          ).length,
          importableQuestions: current.reduce(
            (total, entry) => total + (entry.questionCount ?? 0),
            0,
          ),
          importableThemedQuestions: current.reduce(
            (total, entry) => total + (entry.themedQuestionCount ?? 0),
            0,
          ),
          plannedSimulations: current.filter(
            (entry) => entry.status === 'PLANNED',
          ).length,
        };
      }),
      entries,
      errors: Array.from(new Set(errors)).sort(),
    },
  };
}
