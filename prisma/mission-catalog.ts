import { LearningSegment } from "@prisma/client";
import { CatalogQuiz, readQuizCatalog } from "./quiz-catalog";
import {
  learningDay,
  missionWeek,
  SCHOOL_YEARS,
  segmentForSchoolYear,
} from "../src/modules/learning/learning-calendar";

const copy: Record<LearningSegment, [string, string, string]> = {
  INFANTIL: [
    "Descobertas com o Bolinha",
    "Mais uma brincadeira",
    "Explore as atividades com um adulto. Vocês podem fazer uma pausa quando quiserem.",
  ],
  FUNDAMENTAL_I: [
    "Explorar e descobrir",
    "Um passo a mais",
    "Observe as pistas e experimente uma ideia de cada vez. Você pode continuar depois.",
  ],
  FUNDAMENTAL_II: [
    "Conectar ideias",
    "Praticar um novo tema",
    "Conecte os temas e confira a explicação de cada resposta. Escolha seu ritmo.",
  ],
  MEDIO: [
    "Revisão da semana",
    "Aplicar conhecimentos",
    "Revise os conceitos e examine as explicações. As atividades ficam disponíveis para prática.",
  ],
  ENFERMAGEM: [
    "Fundamentos do cuidado",
    "Decisões na prática",
    "Reflita sobre cuidado, comunicação e ética. A prática complementa seus estudos.",
  ],
};

export function currentMissionWeek(instant = new Date()): string {
  const date = new Date(`${learningDay(instant)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

// Proposed curation only. This exporter never connects to a database or publishes.
export function missionDraftInventory(
  weekStart: string,
  catalog: CatalogQuiz[] = readQuizCatalog(),
) {
  const window = missionWeek(weekStart);
  const missions = SCHOOL_YEARS.flatMap((schoolYear) => {
    const quizzes = catalog
      .filter((q) => q.schoolYear === schoolYear && q.turmaSlug === null)
      .sort((a, b) => a.activityKey.localeCompare(b.activityKey));
    if (
      quizzes.length !== 3 ||
      new Set(quizzes.map((q) => q.activityKey)).size !== 3
    )
      throw new Error(
        `Prepare três quizzes públicos distintos para o ano ${schoolYear}.`,
      );
    const segment = segmentForSchoolYear(schoolYear);
    const [firstTitle, secondTitle, description] = copy[segment];
    return [[quizzes[0], quizzes[1]], [quizzes[2]]].map(
      (activities, index) => ({
        status: "DRAFT" as const,
        review: "PENDING" as const,
        payload: {
          title: index === 0 ? firstTitle : secondTitle,
          description,
          segment,
          schoolYear,
          weekStart,
          slot: index + 1,
          activityKeys: activities.map((q) => q.activityKey),
        },
        activities: activities.map((q) => ({
          activityKey: q.activityKey,
          title: q.title,
          contentVersion: q.contentVersion,
          quizReview: q.review.status,
        })),
      }),
    );
  });
  return {
    weekStart,
    startsAt: window.startsAt.toISOString(),
    endsAt: window.endsAt.toISOString(),
    missionCount: missions.length,
    audiences: SCHOOL_YEARS.length,
    editorialStatus: "PENDING",
    coverage: SCHOOL_YEARS.map((schoolYear) => ({
      schoolYear,
      segment: segmentForSchoolYear(schoolYear),
      missions: 2,
    })),
    missions,
  };
}
