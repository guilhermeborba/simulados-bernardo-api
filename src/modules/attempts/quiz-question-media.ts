import { parseStoredQuizMedia } from '../quizzes/media/quiz-media';

/** Instruction media is public only through the authorized attempt route. */
export function publicQuizQuestionMedia(
  value: unknown,
  attemptId: string,
  questionId: string,
) {
  const media = parseStoredQuizMedia(value);
  if (!media) return null;
  const route = `/attempts/${encodeURIComponent(attemptId)}/questions/${encodeURIComponent(questionId)}/media`;
  return {
    ...(media.image
      ? { image: { url: `${route}/image`, alt: media.image.alt } }
      : {}),
    ...(media.audio
      ? { audio: { url: `${route}/audio`, transcript: media.audio.transcript } }
      : {}),
  };
}
