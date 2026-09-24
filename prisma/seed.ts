import { existsSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { Script, createContext } from 'node:vm';
import { hash } from 'bcryptjs';
import {
  Prisma,
  PrismaClient,
  QuestionType,
  SimulationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as ts from 'typescript';
import { slugify } from '../src/common/utils/slugify';

const prisma = new PrismaClient();

const frontendDataDir =
  process.env.FRONTEND_DATA_DIR ??
  resolve(process.cwd(), 'prisma/seed-data');

interface FrontendOption {
  id: string | number;
  text: string;
}

interface FrontendPair {
  left: FrontendOption;
  right: FrontendOption[];
}

interface FrontendQuestion {
  id: string | number;
  type:
    | 'multiple_choice'
    | 'true_false_multiple'
    | 'matching'
    | 'classification';
  text: string;
  options?: FrontendOption[];
  items?: FrontendOption[];
  pairs?: FrontendPair[];
  correctAnswer: string | Record<string, string>;
  tip?: string;
  /** "Você sabia?" — curiosidade mostrada sempre no resultado, acertando ou errando. */
  funFact?: string;
  points?: number;
}

interface DisciplineSeed {
  name: string;
  slug: string;
  description: string;
  icon: string;
  themeColor: string;
  hidden?: boolean;
}

interface TurmaSeed {
  name: string;
  slug: string;
  schoolYear?: number;
  /**
   * Ranking da turma só conta tentativas finalizadas a partir desta data.
   * Fica fixa no código: recalcular a cada deploy zeraria o ranking sempre.
   */
  rankingCountsFrom?: Date;
}

interface SimulationSeed {
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
  /**
   * Eixo temático, usado só no curso técnico. Na educação básica o simulado é
   * encontrado por ano/bimestre/avaliação e este campo fica vazio.
   */
  topic?: string;
  /**
   * Turma dona do simulado. Preenchido, ele sai do catálogo público e só
   * aparece para quem entrou na turma pelo link de convite.
   */
  turmaSlug?: string;
}

interface NormalizedSimulationSeed
  extends Omit<SimulationSeed, 'file' | 'exportName'> {
  questions: FrontendQuestion[];
}

const disciplines: DisciplineSeed[] = [
  {
    name: 'Português',
    slug: 'portugues',
    description:
      'Fonética, gramática, ortografia, substantivos e verbos em questões interativas.',
    icon: '📖',
    themeColor: '#E54F94',
  },
  {
    name: 'Matemática',
    slug: 'matematica',
    description: 'Aritmética, geometria e lógica com problemas personalizados.',
    icon: '🧮',
    themeColor: '#4A95E5',
  },
  {
    name: 'Ciências',
    slug: 'ciencias',
    description: 'Seres vivos, corpo humano, meio ambiente e ecologia.',
    icon: '🔬',
    themeColor: '#2FB867',
  },
  {
    name: 'História',
    slug: 'historia',
    description: 'Fatos históricos, cultura, sociedade e convivência.',
    icon: '🏛️',
    themeColor: '#F5B91E',
  },
  {
    name: 'Geografia',
    slug: 'geografia',
    description: 'Mapas, regiões, paisagens e espaço geográfico.',
    icon: '🌎',
    themeColor: '#8B6DE0',
  },
  {
    name: 'Enfermagem',
    slug: 'enfermagem',
    description:
      'Fundamentos, ética e legislação do Curso Técnico em Enfermagem.',
    icon: '🩺',
    themeColor: '#2FB867',
  },
  {
    name: 'O eu, o outro e o nós',
    slug: 'infantil-eu-outro-nos',
    description:
      'Família, corpo, emoções e rotina — campo de experiência da BNCC para a Educação Infantil.',
    icon: '🧸',
    themeColor: '#FF8FA3',
  },
  {
    name: 'Corpo, gestos e movimentos',
    slug: 'infantil-corpo-gestos-movimentos',
    description:
      'Brincadeiras de mexer o corpo e como os animais se movem — campo de experiência da BNCC para a Educação Infantil.',
    icon: '🤸',
    themeColor: '#4ECDC4',
  },
  {
    name: 'Traços, sons, cores e formas',
    slug: 'infantil-tracos-sons-cores-formas',
    description:
      'Cores, formas geométricas e sons de animais e instrumentos — campo de experiência da BNCC para a Educação Infantil.',
    icon: '🎨',
    themeColor: '#FFB84D',
  },
  {
    name: 'Escuta, fala, pensamento e imaginação',
    slug: 'infantil-escuta-fala-pensamento-imaginacao',
    description:
      'Historinhas, rimas e faz de conta — campo de experiência da BNCC para a Educação Infantil.',
    icon: '🦄',
    themeColor: '#A78BFA',
  },
  {
    name: 'Espaços, tempos, quantidades, relações e transformações',
    slug: 'infantil-espacos-tempos-quantidades',
    description:
      'Contar, comparar, tempo e categorias — campo de experiência da BNCC para a Educação Infantil.',
    icon: '🔢',
    themeColor: '#FF9F5A',
  },
];

const turmas: TurmaSeed[] = [
  {
    name: '3º ano — Turma do Bernardo',
    slug: 'turma-bernardo',
    schoolYear: 3,
    rankingCountsFrom: new Date('2026-09-15T00:00:00-03:00'),
  },
];

const simulations: SimulationSeed[] = [
  {
    file: 'questoes-matematica-4ano-b3-av1.ts',
    exportName: 'questoesMatematica4AnoB3Av1',
    disciplineSlug: 'matematica',
    schoolYear: 4,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '3º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-4ano-b2-av2.ts',
    exportName: 'questoesMatematica4AnoB2Av2',
    disciplineSlug: 'matematica',
    schoolYear: 4,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 4º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-4ano-b2-av1.ts',
    exportName: 'questoesMatematica4AnoB2Av1',
    disciplineSlug: 'matematica',
    schoolYear: 4,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-4ano-b1-av2.ts',
    exportName: 'questoesMatematica4AnoB1Av2',
    disciplineSlug: 'matematica',
    schoolYear: 4,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 4º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-4ano-b1-av1.ts',
    exportName: 'questoesMatematica4AnoB1Av1',
    disciplineSlug: 'matematica',
    schoolYear: 4,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-4ano-b1-av1.ts',
    exportName: 'questoesPortugues4AnoB1Av1',
    disciplineSlug: 'portugues',
    schoolYear: 4,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '1º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b4-av2.ts',
    exportName: 'questoesGeografia4AnoB4Av2',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 4º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b4-av1.ts',
    exportName: 'questoesGeografia4AnoB4Av1',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b3-av2.ts',
    exportName: 'questoesGeografia4AnoB3Av2',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 4º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b3-av1.ts',
    exportName: 'questoesGeografia4AnoB3Av1',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b2-av2.ts',
    exportName: 'questoesGeografia4AnoB2Av2',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 4º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b2-av1.ts',
    exportName: 'questoesGeografia4AnoB2Av1',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b1-av2.ts',
    exportName: 'questoesGeografia4AnoB1Av2',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 4º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-4ano-b1-av1.ts',
    exportName: 'questoesGeografia4AnoB1Av1',
    disciplineSlug: 'geografia',
    schoolYear: 4,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 4º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-3ano-b2-av2.ts',
    exportName: 'questoesHistoria3AnoB2Av2',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '2º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'historia-3-ano-2-bimestre-av2-publico',
  },
  {
    file: 'questoes-historia-3ano-b2-av1.ts',
    exportName: 'questoesHistoria3AnoB2Av1',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '2º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'historia-3-ano-2-bimestre-av1-publico',
  },
  {
    file: 'questoes-historia-3ano-b1-av2.ts',
    exportName: 'questoesHistoria3AnoB1Av2',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'historia-3-ano-1-bimestre-av2-publico',
  },
  {
    file: 'questoes-historia-3ano-b1-av1.ts',
    exportName: 'questoesHistoria3AnoB1Av1',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Turma-bernardo só tem AV2 nesse bimestre/matéria — sem colisão de slug.
  },
  {
    file: 'questoes-historia-3ano-b4-av2.ts',
    exportName: 'questoesHistoria3AnoB4Av2',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '4º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    slug: 'historia-3-ano-4-bimestre-av2-publico',
  },
  {
    file: 'questoes-historia-3ano-b4-av1.ts',
    exportName: 'questoesHistoria3AnoB4Av1',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '4º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    slug: 'historia-3-ano-4-bimestre-av1-publico',
  },
  {
    file: 'questoes-historia-3ano-b3-av2.ts',
    exportName: 'questoesHistoria3AnoB3Av2',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '3º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    slug: 'historia-3-ano-3-bimestre-av2-publico',
  },
  {
    file: 'questoes-historia-3ano-b3-av1.ts',
    exportName: 'questoesHistoria3AnoB3Av1',
    disciplineSlug: 'historia',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '3º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    slug: 'historia-3-ano-3-bimestre-av1-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b4-av2.ts',
    exportName: 'questoesCiencias3AnoB4Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '4º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Ainda não existe conteúdo de turma-bernardo para o 4º bimestre,
    // mas ele está previsto — slug explícito aplicado preemptivamente
    // para evitar colisão futura (mesmo padrão de Matemática).
    slug: 'ciencias-3-ano-4-bimestre-av2-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b4-av1.ts',
    exportName: 'questoesCiencias3AnoB4Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '4º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Ainda não existe conteúdo de turma-bernardo para o 4º bimestre,
    // mas ele está previsto — slug explícito aplicado preemptivamente
    // para evitar colisão futura (mesmo padrão de Matemática).
    slug: 'ciencias-3-ano-4-bimestre-av1-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b3-av2.ts',
    exportName: 'questoesCiencias3AnoB3Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '3º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'ciencias-3-ano-3-bimestre-av2-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b3-av1.ts',
    exportName: 'questoesCiencias3AnoB3Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '3º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'ciencias-3-ano-3-bimestre-av1-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b2-av2.ts',
    exportName: 'questoesCiencias3AnoB2Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '2º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'ciencias-3-ano-2-bimestre-av2-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b2-av1.ts',
    exportName: 'questoesCiencias3AnoB2Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '2º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'ciencias-3-ano-2-bimestre-av1-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b1-av2.ts',
    exportName: 'questoesCiencias3AnoB1Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'ciencias-3-ano-1-bimestre-av2-publico',
  },
  {
    file: 'questoes-ciencias-3ano-b1-av1.ts',
    exportName: 'questoesCiencias3AnoB1Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Turma-bernardo só tem AV2 nesse bimestre/matéria — sem colisão de slug.
  },
  {
    file: 'questoes-matematica-3ano-b4-av2.ts',
    exportName: 'questoesMatematica3AnoB4Av2',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '4º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Ainda não existe conteúdo de turma-bernardo para o 4º bimestre,
    // mas ele está previsto — slug explícito aplicado preemptivamente
    // para evitar colisão futura (mesmo padrão dos demais bimestres).
    slug: 'matematica-3-ano-4-bimestre-av2-publico',
  },
  {
    file: 'questoes-matematica-3ano-b4-av1.ts',
    exportName: 'questoesMatematica3AnoB4Av1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '4º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Ainda não existe conteúdo de turma-bernardo para o 4º bimestre,
    // mas ele está previsto — slug explícito aplicado preemptivamente
    // para evitar colisão futura (mesmo padrão dos demais bimestres).
    slug: 'matematica-3-ano-4-bimestre-av1-publico',
  },
  {
    file: 'questoes-matematica-3ano-b3-av2.ts',
    exportName: 'questoesMatematica3AnoB3Av2',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '3º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'matematica-3-ano-3-bimestre-av2-publico',
  },
  {
    file: 'questoes-matematica-3ano-b3-av1.ts',
    exportName: 'questoesMatematica3AnoB3Av1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '3º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'matematica-3-ano-3-bimestre-av1-publico',
  },
  {
    file: 'questoes-matematica-3ano-b2-av2.ts',
    exportName: 'questoesMatematica3AnoB2Av2',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'matematica-3-ano-2-bimestre-av2-publico',
  },
  {
    file: 'questoes-matematica-3ano-b2-av1.ts',
    exportName: 'questoesMatematica3AnoB2Av1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'matematica-3-ano-2-bimestre-av1-publico',
  },
  {
    file: 'questoes-matematica-3ano-b1-av2.ts',
    exportName: 'questoesMatematica3AnoB1Av2',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em seed.ts — ver memória do projeto.
    slug: 'matematica-3-ano-1-bimestre-av2-publico',
  },
  {
    file: 'questoes-matematica-3ano-b1-av1.ts',
    exportName: 'questoesMatematica3AnoB1Av1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Turma-bernardo só tem AV2 nesse bimestre/matéria — sem colisão de slug.
  },
  {
    file: 'questoes-portugues-3ano-b4-av2.ts',
    exportName: 'questoesPortugues3AnoB4Av2',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '4º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-3ano-b4-av1.ts',
    exportName: 'questoesPortugues3AnoB4Av1',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '4º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-3ano-b3-av2.ts',
    exportName: 'questoesPortugues3AnoB3Av2',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '3º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em questoes-portugues.ts — ver memória do projeto.
    slug: 'portugues-3-ano-3-bimestre-av2-publico',
  },
  {
    file: 'questoes-portugues-3ano-b3-av1.ts',
    exportName: 'questoesPortugues3AnoB3Av1',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '3º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em questoes-portugues.ts — ver memória do projeto.
    slug: 'portugues-3-ano-3-bimestre-av1-publico',
  },
  {
    file: 'questoes-portugues-3ano-b2-av2.ts',
    exportName: 'questoesPortugues3AnoB2Av2',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '2º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em questoes-portugues.ts — ver memória do projeto.
    slug: 'portugues-3-ano-2-bimestre-av2-publico',
  },
  {
    file: 'questoes-portugues-3ano-b2-av1.ts',
    exportName: 'questoesPortugues3AnoB2Av1',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '2º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em questoes-portugues.ts — ver memória do projeto.
    slug: 'portugues-3-ano-2-bimestre-av1-publico',
  },
  {
    file: 'questoes-portugues-3ano-b1-av2.ts',
    exportName: 'questoesPortugues3AnoB1Av2',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe conteúdo de turma (turma-bernardo) para essa mesma
    // combinação em questoes-portugues.ts — ver memória do projeto.
    slug: 'portugues-3-ano-1-bimestre-av2-publico',
  },
  {
    file: 'questoes-portugues-3ano-b1-av1.ts',
    exportName: 'questoesPortugues3AnoB1Av1',
    disciplineSlug: 'portugues',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '1º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Sem colisão: o Bimestre 1 de Português do 3º ano (turma-bernardo, em
    // questoes-portugues.ts) só tem AV2, não AV1 — ver memória do projeto.
  },
  {
    file: 'questoes-geografia-3ano-b4-av2.ts',
    exportName: 'questoesGeografia3AnoB4Av2',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-3ano-b4-av1.ts',
    exportName: 'questoesGeografia3AnoB4Av1',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-3ano-b3-av2.ts',
    exportName: 'questoesGeografia3AnoB3Av2',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe um simulado de turma (turma-bernardo) para essa mesma
    // combinação — ver memória do projeto sobre colisão de slug no 3º ano.
    slug: 'geografia-3-ano-3-bimestre-av2-publico',
  },
  {
    file: 'questoes-geografia-3ano-b3-av1.ts',
    exportName: 'questoesGeografia3AnoB3Av1',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe um simulado de turma (turma-bernardo) para essa mesma
    // combinação — ver memória do projeto sobre colisão de slug no 3º ano.
    slug: 'geografia-3-ano-3-bimestre-av1-publico',
  },
  {
    file: 'questoes-geografia-3ano-b2-av2.ts',
    exportName: 'questoesGeografia3AnoB2Av2',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Já existe um simulado de turma (turma-bernardo) para essa mesma
    // combinação — ver memória do projeto sobre colisão de slug no 3º ano.
    slug: 'geografia-3-ano-2-bimestre-av2-publico',
  },
  {
    file: 'questoes-geografia-3ano-b2-av1.ts',
    exportName: 'questoesGeografia3AnoB2Av1',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
    // Já existe um simulado de turma (turma-bernardo) para essa mesma
    // combinação — ver memória do projeto sobre colisão de slug no 3º ano.
    slug: 'geografia-3-ano-2-bimestre-av1-publico',
  },
  {
    file: 'questoes-geografia-3ano-b1-av2.ts',
    exportName: 'questoesGeografia3AnoB1Av2',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 30,
    // Slug explícito: já existe um simulado de turma (turma-bernardo) para essa
    // mesma combinação disciplina/ano/bimestre/avaliação, e getSimulationSlug()
    // não diferencia público de turma — sem isso, o upsert colidiria com ele.
    slug: 'geografia-3-ano-1-bimestre-av2-publico',
  },
  {
    file: 'questoes-geografia-3ano-b1-av1.ts',
    exportName: 'questoesGeografia3AnoB1Av1',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 3º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b4-av2.ts',
    exportName: 'questoesHistoria2AnoB4Av2',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '4º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b4-av1.ts',
    exportName: 'questoesHistoria2AnoB4Av1',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '4º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b3-av2.ts',
    exportName: 'questoesHistoria2AnoB3Av2',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '3º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b3-av1.ts',
    exportName: 'questoesHistoria2AnoB3Av1',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '3º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b2-av2.ts',
    exportName: 'questoesHistoria2AnoB2Av2',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '2º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b2-av1.ts',
    exportName: 'questoesHistoria2AnoB2Av1',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '2º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b1-av2.ts',
    exportName: 'questoesHistoria2AnoB1Av2',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-2ano-b1-av1.ts',
    exportName: 'questoesHistoria2AnoB1Av1',
    disciplineSlug: 'historia',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b4-av2.ts',
    exportName: 'questoesCiencias2AnoB4Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '4º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b4-av1.ts',
    exportName: 'questoesCiencias2AnoB4Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '4º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b3-av2.ts',
    exportName: 'questoesCiencias2AnoB3Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '3º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b3-av1.ts',
    exportName: 'questoesCiencias2AnoB3Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '3º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b2-av2.ts',
    exportName: 'questoesCiencias2AnoB2Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '2º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b2-av1.ts',
    exportName: 'questoesCiencias2AnoB2Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '2º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b1-av2.ts',
    exportName: 'questoesCiencias2AnoB1Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-2ano-b1-av1.ts',
    exportName: 'questoesCiencias2AnoB1Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b4-av2.ts',
    exportName: 'questoesMatematica2AnoB4Av2',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '4º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b4-av1.ts',
    exportName: 'questoesMatematica2AnoB4Av1',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '4º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b3-av2.ts',
    exportName: 'questoesMatematica2AnoB3Av2',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '3º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b3-av1.ts',
    exportName: 'questoesMatematica2AnoB3Av1',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '3º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b2-av2.ts',
    exportName: 'questoesMatematica2AnoB2Av2',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b2-av1.ts',
    exportName: 'questoesMatematica2AnoB2Av1',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b1-av1.ts',
    exportName: 'questoesMatematica2AnoB1Av1',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-2ano-b1-av2.ts',
    exportName: 'questoesMatematica2AnoB1Av2',
    disciplineSlug: 'matematica',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b1-av1.ts',
    exportName: 'questoesPortugues2AnoB1Av1',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '1º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b1-av2.ts',
    exportName: 'questoesPortugues2AnoB1Av2',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '1º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b2-av1.ts',
    exportName: 'questoesPortugues2AnoB2Av1',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '2º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b2-av2.ts',
    exportName: 'questoesPortugues2AnoB2Av2',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '2º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b3-av1.ts',
    exportName: 'questoesPortugues2AnoB3Av1',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '3º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b3-av2.ts',
    exportName: 'questoesPortugues2AnoB3Av2',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '3º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b4-av1.ts',
    exportName: 'questoesPortugues2AnoB4Av1',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '4º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-2ano-b4-av2.ts',
    exportName: 'questoesPortugues2AnoB4Av2',
    disciplineSlug: 'portugues',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '4º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b1-av1.ts',
    exportName: 'questoesGeografia2AnoB1Av1',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b1-av2.ts',
    exportName: 'questoesGeografia2AnoB1Av2',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b2-av1.ts',
    exportName: 'questoesGeografia2AnoB2Av1',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b2-av2.ts',
    exportName: 'questoesGeografia2AnoB2Av2',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b3-av1.ts',
    exportName: 'questoesGeografia2AnoB3Av1',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b3-av2.ts',
    exportName: 'questoesGeografia2AnoB3Av2',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b4-av1.ts',
    exportName: 'questoesGeografia2AnoB4Av1',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 2º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-2ano-b4-av2.ts',
    exportName: 'questoesGeografia2AnoB4Av2',
    disciplineSlug: 'geografia',
    schoolYear: 2,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 2º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b1-av1.ts',
    exportName: 'questoesHistoria1AnoB1Av1',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b1-av2.ts',
    exportName: 'questoesHistoria1AnoB1Av2',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b2-av1.ts',
    exportName: 'questoesHistoria1AnoB2Av1',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '2º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b2-av2.ts',
    exportName: 'questoesHistoria1AnoB2Av2',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '2º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b3-av1.ts',
    exportName: 'questoesHistoria1AnoB3Av1',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '3º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b3-av2.ts',
    exportName: 'questoesHistoria1AnoB3Av2',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '3º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b4-av1.ts',
    exportName: 'questoesHistoria1AnoB4Av1',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de História',
    subtitle: '4º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-historia-1ano-b4-av2.ts',
    exportName: 'questoesHistoria1AnoB4Av2',
    disciplineSlug: 'historia',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '4º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b1-av1.ts',
    exportName: 'questoesCiencias1AnoB1Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b1-av2.ts',
    exportName: 'questoesCiencias1AnoB1Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b2-av1.ts',
    exportName: 'questoesCiencias1AnoB2Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '2º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b2-av2.ts',
    exportName: 'questoesCiencias1AnoB2Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '2º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b3-av1.ts',
    exportName: 'questoesCiencias1AnoB3Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '3º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b3-av2.ts',
    exportName: 'questoesCiencias1AnoB3Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '3º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b4-av1.ts',
    exportName: 'questoesCiencias1AnoB4Av1',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Ciências',
    subtitle: '4º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-ciencias-1ano-b4-av2.ts',
    exportName: 'questoesCiencias1AnoB4Av2',
    disciplineSlug: 'ciencias',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '4º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b1-av1.ts',
    exportName: 'questoesMatematica1AnoB1Av1',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b1-av2.ts',
    exportName: 'questoesMatematica1AnoB1Av2',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b2-av1.ts',
    exportName: 'questoesMatematica1AnoB2Av1',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b2-av2.ts',
    exportName: 'questoesMatematica1AnoB2Av2',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '2º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b3-av1.ts',
    exportName: 'questoesMatematica1AnoB3Av1',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '3º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b3-av2.ts',
    exportName: 'questoesMatematica1AnoB3Av2',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '3º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b4-av1.ts',
    exportName: 'questoesMatematica1AnoB4Av1',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Matemática',
    subtitle: '4º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica-1ano-b4-av2.ts',
    exportName: 'questoesMatematica1AnoB4Av2',
    disciplineSlug: 'matematica',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '4º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b1-av1.ts',
    exportName: 'questoesPortugues1AnoB1Av1',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '1º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b1-av2.ts',
    exportName: 'questoesPortugues1AnoB1Av2',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '1º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b2-av1.ts',
    exportName: 'questoesPortugues1AnoB2Av1',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '2º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b2-av2.ts',
    exportName: 'questoesPortugues1AnoB2Av2',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '2º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b3-av1.ts',
    exportName: 'questoesPortugues1AnoB3Av1',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '3º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b3-av2.ts',
    exportName: 'questoesPortugues1AnoB3Av2',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '3º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b4-av1.ts',
    exportName: 'questoesPortugues1AnoB4Av1',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Português',
    subtitle: '4º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-portugues-1ano-b4-av2.ts',
    exportName: 'questoesPortugues1AnoB4Av2',
    disciplineSlug: 'portugues',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Português',
    subtitle: '4º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b1-av1.ts',
    exportName: 'questoesGeografia1AnoB1Av1',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b1-av2.ts',
    exportName: 'questoesGeografia1AnoB1Av2',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b2-av1.ts',
    exportName: 'questoesGeografia1AnoB2Av1',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b2-av2.ts',
    exportName: 'questoesGeografia1AnoB2Av2',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '2º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b3-av1.ts',
    exportName: 'questoesGeografia1AnoB3Av1',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b3-av2.ts',
    exportName: 'questoesGeografia1AnoB3Av2',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '3º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b4-av1.ts',
    exportName: 'questoesGeografia1AnoB4Av1',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV1',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 1º Ano — AV1',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-geografia-1ano-b4-av2.ts',
    exportName: 'questoesGeografia1AnoB4Av2',
    disciplineSlug: 'geografia',
    schoolYear: 1,
    bimester: 4,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '4º Bimestre — 1º Ano — AV2',
    estimatedDurationMinutes: 30,
  },
  {
    file: 'questoes-matematica.ts',
    exportName: 'questoesMathematica',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Matemática',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-matematica-av1.ts',
    exportName: 'questoesMatematicaAv1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — Matemática',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-matematica-av2.ts',
    exportName: 'questoesMatematicaAv2',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — Matemática',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-matematica-3bim-av1.ts',
    exportName: 'questoesMatematica3BimAv1',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — Matemática',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-matematica-3bim-av2.ts',
    exportName: 'questoesMatematica3BimAv2',
    disciplineSlug: 'matematica',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado AV2 — Matemática',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias.ts',
    exportName: 'questoesCiencias',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Ciências',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias-av1.ts',
    exportName: 'questoesCienciasAv1',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — Ciências',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias-av2.ts',
    exportName: 'questoesCienciasAv2',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — Ciências',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias-3bim-av1.ts',
    exportName: 'questoesCienciasAv1Bim3',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — Ciências',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-ciencias-3bim-av2.ts',
    exportName: 'questoesCienciasAv2Bim3',
    disciplineSlug: 'ciencias',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado AV2 — Ciências',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia.ts',
    exportName: 'questoesHistoria',
    disciplineSlug: 'historia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de História',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia-av1.ts',
    exportName: 'questoesHistoriaAv1',
    disciplineSlug: 'historia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — História',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia-av2.ts',
    exportName: 'questoesHistoriaAv2',
    disciplineSlug: 'historia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — História',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia-3bim-av1.ts',
    exportName: 'questoesHistoriaAv1Bim3',
    disciplineSlug: 'historia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — História',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-historia-3bim-av2.ts',
    exportName: 'questoesHistoriaAv2Bim3',
    disciplineSlug: 'historia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado AV2 — História',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia.ts',
    exportName: 'questoesGeografia',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 1,
    assessment: 'AV2',
    title: 'Simulado de Geografia',
    subtitle: '1º Bimestre — 3º Ano — AV2',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia-av1.ts',
    exportName: 'questoesGeografiaAv1',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV1',
    title: 'Simulado AV1 — Geografia',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia-av2.ts',
    exportName: 'questoesGeografiaAv2',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 2,
    assessment: 'AV2',
    title: 'Simulado AV2 — Geografia',
    subtitle: '2º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia-3bim-av1.ts',
    exportName: 'questoesGeografiaAv1Bim3',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV1',
    title: 'Simulado AV1 — Geografia',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-geografia-3bim-av2.ts',
    exportName: 'questoesGeografiaAv2Bim3',
    disciplineSlug: 'geografia',
    schoolYear: 3,
    turmaSlug: 'turma-bernardo',
    bimester: 3,
    assessment: 'AV2',
    title: 'Simulado AV2 — Geografia',
    subtitle: '3º Bimestre — 3º Ano',
    estimatedDurationMinutes: 45,
  },
  {
    file: 'questoes-enfermagem.ts',
    exportName: 'questoesEnfermagem',
    disciplineSlug: 'enfermagem',
    schoolYear: 0,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Fundamentos, Ética e Legislação em Enfermagem',
    subtitle: 'Curso Técnico em Enfermagem — 75 questões',
    estimatedDurationMinutes: 90,
    slug: 'enfermagem',
    topic: 'Fundamentos, Ética e Legislação',
  },
  {
    file: 'questoes-infantil4-eu-outro-nos.ts',
    exportName: 'questoesInfantil4EuOutroNos',
    disciplineSlug: 'infantil-eu-outro-nos',
    // -1 = Infantil 4 anos, espelha INFANTIL_4_SCHOOL_YEAR em lib/trilha.ts
    // no frontend. Os dois precisam concordar nesse valor.
    schoolYear: -1,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Eu, minha família e meus sentimentos',
    subtitle: 'Educação Infantil 4 anos — Campo: O eu, o outro e o nós',
    estimatedDurationMinutes: 25,
    slug: 'infantil4-eu-outro-nos',
    topic: 'Eu, minha família e meus sentimentos',
  },
  {
    file: 'questoes-infantil4-corpo-movimento.ts',
    exportName: 'questoesInfantil4CorpoMovimento',
    disciplineSlug: 'infantil-corpo-gestos-movimentos',
    schoolYear: -1,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Meu corpo em movimento e os animais',
    subtitle: 'Educação Infantil 4 anos — Campo: Corpo, gestos e movimentos',
    estimatedDurationMinutes: 25,
    slug: 'infantil4-corpo-movimento',
    topic: 'Meu corpo em movimento e os animais',
  },
  {
    file: 'questoes-infantil4-tracos-sons-cores-formas.ts',
    exportName: 'questoesInfantil4TracosSonsCoresFormas',
    disciplineSlug: 'infantil-tracos-sons-cores-formas',
    schoolYear: -1,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Cores, formas e sons ao redor',
    subtitle: 'Educação Infantil 4 anos — Campo: Traços, sons, cores e formas',
    estimatedDurationMinutes: 25,
    slug: 'infantil4-tracos-sons-cores-formas',
    topic: 'Cores, formas e sons ao redor',
  },
  {
    file: 'questoes-infantil4-escuta-fala-imaginacao.ts',
    exportName: 'questoesInfantil4EscutaFalaImaginacao',
    disciplineSlug: 'infantil-escuta-fala-pensamento-imaginacao',
    schoolYear: -1,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Historinhas, bichos e rimas',
    subtitle: 'Educação Infantil 4 anos — Campo: Escuta, fala, pensamento e imaginação',
    estimatedDurationMinutes: 25,
    slug: 'infantil4-escuta-fala-imaginacao',
    topic: 'Historinhas, bichos e rimas',
  },
  {
    file: 'questoes-infantil4-espacos-tempos-quantidades.ts',
    exportName: 'questoesInfantil4EspacosTemposQuantidades',
    disciplineSlug: 'infantil-espacos-tempos-quantidades',
    schoolYear: -1,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Contando e comparando o mundo',
    subtitle: 'Educação Infantil 4 anos — Campo: Espaços, tempos, quantidades, relações e transformações',
    estimatedDurationMinutes: 25,
    slug: 'infantil4-espacos-tempos-quantidades',
    topic: 'Contando e comparando o mundo',
  },
  {
    file: 'questoes-infantil5-eu-outro-nos.ts',
    exportName: 'questoesInfantil5EuOutroNos',
    disciplineSlug: 'infantil-eu-outro-nos',
    // -2 = Infantil 5 anos, espelha INFANTIL_5_SCHOOL_YEAR em lib/trilha.ts
    // no frontend. Os dois precisam concordar nesse valor.
    schoolYear: -2,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Amizade, profissões e quem eu sou',
    subtitle: 'Educação Infantil 5 anos — Campo: O eu, o outro e o nós',
    estimatedDurationMinutes: 25,
    slug: 'infantil5-eu-outro-nos',
    topic: 'Amizade, profissões e quem eu sou',
  },
  {
    file: 'questoes-infantil5-corpo-movimento.ts',
    exportName: 'questoesInfantil5CorpoMovimento',
    disciplineSlug: 'infantil-corpo-gestos-movimentos',
    schoolYear: -2,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Esportes, sequências e lateralidade',
    subtitle: 'Educação Infantil 5 anos — Campo: Corpo, gestos e movimentos',
    estimatedDurationMinutes: 25,
    slug: 'infantil5-corpo-movimento',
    topic: 'Esportes, sequências e lateralidade',
  },
  {
    file: 'questoes-infantil5-tracos-sons-cores-formas.ts',
    exportName: 'questoesInfantil5TracosSonsCoresFormas',
    disciplineSlug: 'infantil-tracos-sons-cores-formas',
    schoolYear: -2,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Cores, formas e arte',
    subtitle: 'Educação Infantil 5 anos — Campo: Traços, sons, cores e formas',
    estimatedDurationMinutes: 25,
    slug: 'infantil5-tracos-sons-cores-formas',
    topic: 'Cores, formas e arte',
  },
  {
    file: 'questoes-infantil5-escuta-fala-imaginacao.ts',
    exportName: 'questoesInfantil5EscutaFalaImaginacao',
    disciplineSlug: 'infantil-escuta-fala-pensamento-imaginacao',
    schoolYear: -2,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Minhas letras, rimas e sequência de histórias',
    subtitle: 'Educação Infantil 5 anos — Campo: Escuta, fala, pensamento e imaginação',
    estimatedDurationMinutes: 25,
    slug: 'infantil5-escuta-fala-imaginacao',
    topic: 'Minhas letras, rimas e sequência de histórias',
  },
  {
    file: 'questoes-infantil5-espacos-tempos-quantidades.ts',
    exportName: 'questoesInfantil5EspacosTemposQuantidades',
    disciplineSlug: 'infantil-espacos-tempos-quantidades',
    schoolYear: -2,
    bimester: 0,
    assessment: 'UNICO',
    title: 'Simulado — Números até 10, dias da semana e categorias',
    subtitle: 'Educação Infantil 5 anos — Campo: Espaços, tempos, quantidades, relações e transformações',
    estimatedDurationMinutes: 25,
    slug: 'infantil5-espacos-tempos-quantidades',
    topic: 'Números até 10, dias da semana e categorias',
  },
];

async function main() {
  assertFrontendDataDir();

  const normalizedSimulations = loadSimulations();

  if (process.env.SEED_DRY_RUN === 'true') {
    const totalQuestions = normalizedSimulations.reduce(
      (total, simulation) => total + simulation.questions.length,
      0,
    );

    console.log(
      `Dry run concluído: ${disciplines.length} disciplinas, ${normalizedSimulations.length} simulados e ${totalQuestions} questões carregadas.`,
    );
    return;
  }

  const systemUser = await upsertSeedUser();
  const disciplineBySlug = await upsertDisciplines();
  const turmaBySlug = await upsertTurmas();

  for (const simulation of normalizedSimulations) {
    const discipline = disciplineBySlug.get(simulation.disciplineSlug);

    if (!discipline) {
      throw new Error(`Discipline not found: ${simulation.disciplineSlug}`);
    }

    const turma = simulation.turmaSlug
      ? turmaBySlug.get(simulation.turmaSlug)
      : undefined;

    if (simulation.turmaSlug && !turma) {
      throw new Error(`Turma not found: ${simulation.turmaSlug}`);
    }

    const maxScore = getMaxScore(simulation.questions);
    const simulationSlug = simulation.slug ?? getSimulationSlug(simulation);
    const savedSimulation = await prisma.simulation.upsert({
      where: { slug: simulationSlug },
      create: {
        title: simulation.title,
        subtitle: simulation.subtitle,
        slug: simulationSlug,
        schoolYear: simulation.schoolYear,
        bimester: simulation.bimester,
        assessment: simulation.assessment,
        topic: simulation.topic ?? null,
        turmaId: turma?.id ?? null,
        disciplineId: discipline.id,
        status: SimulationStatus.PUBLISHED,
        totalQuestions: simulation.questions.length,
        maxScore,
        estimatedDurationMinutes: simulation.estimatedDurationMinutes,
        createdById: systemUser.id,
        publishedAt: new Date(),
      },
      update: {
        title: simulation.title,
        subtitle: simulation.subtitle,
        schoolYear: simulation.schoolYear,
        bimester: simulation.bimester,
        assessment: simulation.assessment,
        topic: simulation.topic ?? null,
        turmaId: turma?.id ?? null,
        disciplineId: discipline.id,
        status: SimulationStatus.PUBLISHED,
        totalQuestions: simulation.questions.length,
        maxScore,
        estimatedDurationMinutes: simulation.estimatedDurationMinutes,
        publishedAt: new Date(),
        deletedAt: null,
      },
    });

    await upsertQuestions(savedSimulation.id, simulation.questions);
  }

  const membershipsBackfilled = await backfillMembershipsFromAttempts();

  const totalQuestions = normalizedSimulations.reduce(
    (total, simulation) => total + simulation.questions.length,
    0,
  );

  console.log(
    `Seed concluído: ${disciplines.length} disciplinas, ${turmas.length} turmas, ${normalizedSimulations.length} simulados e ${totalQuestions} questões importadas.`,
  );
  console.log(
    `Participações em turma garantidas para quem já tinha tentativa: ${membershipsBackfilled}.`,
  );
}

function assertFrontendDataDir() {
  if (!existsSync(frontendDataDir)) {
    throw new Error(
      `Diretório de dados do front-end não encontrado: ${frontendDataDir}. Configure FRONTEND_DATA_DIR.`,
    );
  }
}

async function upsertSeedUser() {
  const email = 'seed-importer@simulados.local';

  return prisma.user.upsert({
    where: { email },
    create: {
      name: 'Seed Importer',
      email,
      passwordHash: await hash('seed-import-disabled-account', 4),
      role: UserRole.ADMIN,
      status: UserStatus.INACTIVE,
    },
    update: {
      name: 'Seed Importer',
      role: UserRole.ADMIN,
      status: UserStatus.INACTIVE,
      deletedAt: null,
    },
  });
}

async function upsertDisciplines() {
  const entries = await Promise.all(
    disciplines.map(async (discipline) => {
      const savedDiscipline = await prisma.discipline.upsert({
        where: { slug: discipline.slug },
        create: {
          name: discipline.name,
          slug: discipline.slug,
          description: discipline.description,
          icon: discipline.icon,
          themeColor: discipline.themeColor,
          isActive: !discipline.hidden,
        },
        update: {
          name: discipline.name,
          description: discipline.description,
          icon: discipline.icon,
          themeColor: discipline.themeColor,
          isActive: !discipline.hidden,
          deletedAt: null,
        },
      });

      return [discipline.slug, savedDiscipline] as const;
    }),
  );

  return new Map(entries);
}

async function upsertTurmas() {
  const entries = await Promise.all(
    turmas.map(async (turma) => {
      const saved = await prisma.turma.upsert({
        where: { slug: turma.slug },
        create: {
          name: turma.name,
          slug: turma.slug,
          schoolYear: turma.schoolYear,
          rankingCountsFrom: turma.rankingCountsFrom,
        },
        update: {
          name: turma.name,
          schoolYear: turma.schoolYear,
          rankingCountsFrom: turma.rankingCountsFrom,
          deletedAt: null,
        },
      });

      return [turma.slug, saved] as const;
    }),
  );

  return new Map(entries);
}

/**
 * Quem já respondeu um simulado antes de ele passar a ser da turma entra nela.
 * Sem isso, o aluno perderia o acesso ao próprio histórico e não conseguiria
 * retomar uma tentativa que já estava em andamento.
 */
async function backfillMembershipsFromAttempts() {
  const attempts = await prisma.attempt.findMany({
    where: { simulation: { turmaId: { not: null } } },
    select: { studentId: true, simulation: { select: { turmaId: true } } },
    distinct: ['studentId', 'simulationId'],
  });

  const pairs = new Map<string, { turmaId: string; userId: string }>();
  attempts.forEach((attempt) => {
    const turmaId = attempt.simulation.turmaId;
    if (!turmaId) return;
    pairs.set(`${turmaId}:${attempt.studentId}`, {
      turmaId,
      userId: attempt.studentId,
    });
  });

  for (const pair of pairs.values()) {
    await prisma.turmaMembership.upsert({
      where: { turmaId_userId: pair },
      create: pair,
      update: {},
    });
  }

  return pairs.size;
}

function loadSimulations(): NormalizedSimulationSeed[] {
  const flatSimulations = simulations.map((simulation) => {
    const exports = loadDataModule(simulation.file);
    const questions = exports[simulation.exportName] as FrontendQuestion[];

    assertQuestions(simulation.file, questions);

    return {
      ...simulation,
      questions,
    };
  });

  const portugues = loadDataModule('questoes-portugues.ts')
    .questoesPortugues as Record<
    string,
    Record<string, Record<string, FrontendQuestion[]>>
  >;
  const portuguesSimulations = Object.entries(portugues.terceiro ?? {}).flatMap(
    ([bimester, assessments]) =>
      Object.entries(assessments).map(([assessment, questions]) => {
        assertQuestions(`questoes-portugues.ts ${bimester}-${assessment}`, questions);

        return {
          disciplineSlug: 'portugues',
          schoolYear: 3,
          turmaSlug: 'turma-bernardo',
          bimester: Number(bimester),
          assessment,
          title: `Simulado de Português - ${bimester}º Bimestre ${assessment}`,
          subtitle: `${bimester}º Bimestre — 3º Ano`,
          estimatedDurationMinutes: 45,
          questions,
        };
      }),
  );

  return [...flatSimulations, ...portuguesSimulations].sort((a, b) =>
    getSimulationSlug(a).localeCompare(getSimulationSlug(b)),
  );
}

function loadDataModule(file: string): Record<string, unknown> {
  const filePath = join(frontendDataDir, file);
  const source = readFileSync(filePath, 'utf8').replace(/^import .+;$/gm, '');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: basename(filePath),
  });
  const exportsObject: Record<string, unknown> = {};
  const context = createContext({
    exports: exportsObject,
    module: { exports: exportsObject },
    require,
  });
  const script = new Script(transpiled.outputText, {
    filename: filePath,
  });

  script.runInContext(context);

  return exportsObject;
}

function assertQuestions(source: string, questions: unknown): asserts questions is FrontendQuestion[] {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error(`Nenhuma questão encontrada em ${source}`);
  }
}

function getSimulationSlug(
  simulation: Pick<
    NormalizedSimulationSeed,
    'disciplineSlug' | 'schoolYear' | 'bimester' | 'assessment'
  >,
) {
  return slugify(
    `${simulation.disciplineSlug}-${simulation.schoolYear}-ano-${simulation.bimester}-bimestre-${simulation.assessment}`,
  );
}

function getMaxScore(questions: FrontendQuestion[]) {
  return questions.reduce((total, question) => total + (question.points ?? 1), 0);
}

async function upsertQuestions(
  simulationId: string,
  questions: FrontendQuestion[],
) {
  const importedOrders = questions.map((question, index) =>
    getQuestionOrder(question, index),
  );

  for (const [index, question] of questions.entries()) {
    const sortOrder = getQuestionOrder(question, index);
    const savedQuestion = await prisma.question.upsert({
      where: {
        simulationId_sortOrder: {
          simulationId,
          sortOrder,
        },
      },
      create: {
        simulationId,
        type: mapQuestionType(question.type),
        statement: question.text,
        tip: question.tip,
        funFact: question.funFact,
        points: question.points ?? 1,
        sortOrder,
        isActive: true,
      },
      update: {
        type: mapQuestionType(question.type),
        statement: question.text,
        tip: question.tip,
        funFact: question.funFact,
        points: question.points ?? 1,
        isActive: true,
        deletedAt: null,
      },
    });

    await replaceQuestionOptions(savedQuestion.id, question);
    await replaceQuestionAnswers(savedQuestion.id, question);
  }

  await prisma.question.updateMany({
    where: {
      simulationId,
      sortOrder: {
        notIn: importedOrders,
      },
      deletedAt: null,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
}

function getQuestionOrder(question: FrontendQuestion, index: number) {
  const id = Number(question.id);
  return Number.isInteger(id) && id > 0 ? id : index + 1;
}

function mapQuestionType(type: FrontendQuestion['type']) {
  const typeMap: Record<FrontendQuestion['type'], QuestionType> = {
    multiple_choice: QuestionType.MULTIPLE_CHOICE,
    true_false_multiple: QuestionType.TRUE_FALSE_MULTIPLE,
    matching: QuestionType.MATCHING,
    classification: QuestionType.CLASSIFICATION,
  };

  return typeMap[type];
}

async function replaceQuestionOptions(
  questionId: string,
  question: FrontendQuestion,
) {
  await prisma.questionOption.deleteMany({
    where: { questionId },
  });

  const options = toQuestionOptions(question, questionId);

  if (options.length > 0) {
    await prisma.questionOption.createMany({
      data: options,
    });
  }
}

function toQuestionOptions(
  question: FrontendQuestion,
  questionId: string,
): Prisma.QuestionOptionCreateManyInput[] {
  if (question.type === 'multiple_choice') {
    return (question.options ?? []).map((option, index) => ({
      questionId,
      optionKey: String(option.id),
      text: option.text,
      sortOrder: index + 1,
      metadata: { frontendQuestionId: question.id },
    }));
  }

  if (
    question.type === 'true_false_multiple' ||
    question.type === 'classification'
  ) {
    return (question.items ?? []).map((item, index) => ({
      questionId,
      optionKey: String(item.id),
      text: item.text,
      groupKey: question.type === 'classification' ? 'item' : 'statement',
      sortOrder: index + 1,
      metadata: { frontendQuestionId: question.id },
    }));
  }

  const leftOptions = (question.pairs ?? []).map((pair, index) => ({
    questionId,
    optionKey: `left:${pair.left.id}`,
    text: pair.left.text,
    groupKey: 'left',
    sortOrder: index + 1,
    metadata: { frontendQuestionId: question.id },
  }));
  const rightOptionsById = new Map<string, FrontendOption>();

  for (const pair of question.pairs ?? []) {
    for (const right of pair.right) {
      rightOptionsById.set(String(right.id), right);
    }
  }

  const rightOptions = Array.from(rightOptionsById.values()).map(
    (right, index) => ({
      questionId,
      optionKey: `right:${right.id}`,
      text: right.text,
      groupKey: 'right',
      sortOrder: index + 1,
      metadata: { frontendQuestionId: question.id },
    }),
  );

  return [...leftOptions, ...rightOptions];
}

async function replaceQuestionAnswers(
  questionId: string,
  question: FrontendQuestion,
) {
  await prisma.questionAnswer.deleteMany({
    where: { questionId },
  });

  const answers = toQuestionAnswers(question, questionId);

  if (answers.length > 0) {
    await prisma.questionAnswer.createMany({
      data: answers,
    });
  }
}

function toQuestionAnswers(
  question: FrontendQuestion,
  questionId: string,
): Prisma.QuestionAnswerCreateManyInput[] {
  if (typeof question.correctAnswer === 'string') {
    return [
      {
        questionId,
        answerKey: 'correctAnswer',
        answerValue: question.correctAnswer,
        metadata: { frontendQuestionId: question.id },
      },
    ];
  }

  return Object.entries(question.correctAnswer).map(([answerKey, answerValue]) => ({
    questionId,
    answerKey,
    answerValue,
    metadata: { frontendQuestionId: question.id },
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
