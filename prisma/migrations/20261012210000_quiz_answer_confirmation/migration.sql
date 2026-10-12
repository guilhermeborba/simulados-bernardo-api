-- Additive: simulation answers retain their existing correction state.
-- A confirmation and its saved feedback are always written together.
DO $migration$
BEGIN
  ALTER TABLE "AttemptAnswer"
    ADD COLUMN "confirmedAt" TIMESTAMP(3),
    ADD COLUMN "feedback" JSONB;
  ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_confirmation_check" CHECK (
    ("confirmedAt" IS NULL AND "feedback" IS NULL)
    OR (
      "confirmedAt" IS NOT NULL
      AND "feedback" IS NOT NULL
      AND jsonb_typeof("feedback") = 'object'
      AND "isCorrect" IS NOT NULL
      AND "pointsEarned" IS NOT NULL
      AND "pointsEarned" >= 0
      AND "pointsEarned" <= 9999.99
    )
  );
END;
$migration$;
