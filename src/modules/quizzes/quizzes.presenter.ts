import { Prisma } from '@prisma/client';

// Explicit selection prevents newly added private fields from leaking to clients.
export const QUIZ_METADATA_SELECT = {
  id: true,
  activityKind: true,
  activityKey: true,
  contentVersion: true,
  title: true,
  subtitle: true,
  slug: true,
  schoolYear: true,
  topic: true,
  turmaId: true,
  disciplineId: true,
  status: true,
  totalQuestions: true,
  maxScore: true,
  estimatedDurationMinutes: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  discipline: {
    select: { id: true, name: true, slug: true, icon: true, themeColor: true },
  },
} satisfies Prisma.SimulationSelect;

export const QUIZ_ADMIN_SELECT = {
  ...QUIZ_METADATA_SELECT,
  questions: {
    where: { deletedAt: null, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      originKey: true,
      type: true,
      statement: true,
      tip: true,
      funFact: true,
      explanation: true,
      media: true,
      points: true,
      sortOrder: true,
      skill: {
        select: {
          skill: {
            select: {
              id: true,
              code: true,
              version: true,
              title: true,
              status: true,
            },
          },
        },
      },
      options: {
        orderBy: { sortOrder: 'asc' },
        select: { optionKey: true, text: true, sortOrder: true },
      },
    },
  },
} satisfies Prisma.SimulationSelect;

export const QUIZ_PRIVATE_INCLUDE = {
  questions: {
    where: { deletedAt: null, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      options: { orderBy: { sortOrder: 'asc' } },
      skill: { include: { skill: { include: { discipline: true } } } },
      answers: { orderBy: { answerKey: 'asc' } },
    },
  },
} satisfies Prisma.SimulationInclude;
