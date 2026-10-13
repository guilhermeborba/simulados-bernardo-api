/** Version 1: cosmetic progress only; no grades, spending or expiry. */
export const ACHIEVEMENT_CATALOG = [
  {
    id: 'FIRST_QUIZ',
    title: 'Primeiro passo',
    description: 'Conclua seu primeiro quiz.',
    target: 1,
    stat: 'completedQuizzes',
  },
  {
    id: 'THREE_TOPICS',
    title: 'Explorador de temas',
    description: 'Conclua quizzes de três temas diferentes.',
    target: 3,
    stat: 'topics',
  },
  {
    id: 'FIVE_QUIZZES',
    title: 'Cada passo conta',
    description: 'Conclua cinco quizzes diferentes, no seu ritmo.',
    target: 5,
    stat: 'completedQuizzes',
  },
  {
    id: 'FIRST_MISSION',
    title: 'Missão cumprida',
    description: 'Conclua sua primeira missão.',
    target: 1,
    stat: 'completedMissions',
  },
  {
    id: 'XP_100',
    title: 'Novos horizontes',
    description: 'Acumule 100 XP com suas atividades.',
    target: 100,
    stat: 'totalXp',
  },
] as const;

export const AVATAR_ITEM_CATALOG = [
  {
    id: 'inicio',
    title: 'Início',
    description: 'Um símbolo para começar sua coleção.',
    achievementId: null,
  },
  {
    id: 'primeiro-passo',
    title: 'Primeiro passo',
    description: 'Um brilho para celebrar sua primeira conclusão.',
    achievementId: 'FIRST_QUIZ',
  },
  {
    id: 'explorador',
    title: 'Explorador',
    description: 'Uma estrela para quem conhece novos temas.',
    achievementId: 'THREE_TOPICS',
  },
  {
    id: 'constancia',
    title: 'Constância',
    description: 'Um símbolo para seus cinco quizzes diferentes.',
    achievementId: 'FIVE_QUIZZES',
  },
  {
    id: 'missao',
    title: 'Missão',
    description: 'Um emblema para sua primeira missão concluída.',
    achievementId: 'FIRST_MISSION',
  },
  {
    id: 'horizonte',
    title: 'Horizonte',
    description: 'Um símbolo para os 100 XP que você acumulou.',
    achievementId: 'XP_100',
  },
] as const;

export type AchievementId = (typeof ACHIEVEMENT_CATALOG)[number]['id'];
export type AvatarItemId = (typeof AVATAR_ITEM_CATALOG)[number]['id'];

export interface CollectionStats {
  completedQuizzes: number;
  topics: number;
  completedMissions: number;
  totalXp: number;
}

export interface CompletedQuizProgress {
  attemptId: string;
  activityKey: string;
  disciplineId: string;
  topic: string | null;
  completedAt: Date;
  recordedAt: Date;
}

/** First receipt wins across retries and content versions of a logical quiz. */
export function quizProgress(completions: readonly CompletedQuizProgress[]) {
  const firstByActivity = new Map<string, CompletedQuizProgress>();
  const ordered = [...completions].sort(
    (left, right) =>
      left.completedAt.getTime() - right.completedAt.getTime() ||
      left.recordedAt.getTime() - right.recordedAt.getTime() ||
      (left.attemptId < right.attemptId
        ? -1
        : left.attemptId > right.attemptId
          ? 1
          : 0),
  );
  for (const completion of ordered) {
    if (!firstByActivity.has(completion.activityKey)) {
      firstByActivity.set(completion.activityKey, completion);
    }
  }
  const topics = new Set<string>();
  for (const completion of firstByActivity.values()) {
    const topic = completion.topic?.trim().toLowerCase();
    if (topic) topics.add(JSON.stringify([completion.disciplineId, topic]));
  }
  return { completedQuizzes: firstByActivity.size, topics: topics.size };
}
