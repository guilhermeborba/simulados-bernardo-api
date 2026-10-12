-- Additive migration: existing simulations remain SIMULATION and preserve data.
-- A single PostgreSQL DO statement is atomic, including every DDL change.
-- Keeping one statement also preserves the original safety-audit diagnostic
-- when Prisma records a failed migration instead of a later aborted transaction.
DO $migration$
DECLARE
  duplicate_groups BIGINT;
  duplicate_attempts BIGINT;
BEGIN
  -- Prevent a new duplicate between the audit and the partial unique index.
  LOCK TABLE "Attempt" IN SHARE ROW EXCLUSIVE MODE;
  SELECT COUNT(*), COALESCE(SUM(attempt_count), 0)
    INTO duplicate_groups, duplicate_attempts
  FROM (
    SELECT COUNT(*) AS attempt_count
    FROM "Attempt"
    WHERE "status" = 'IN_PROGRESS'
    GROUP BY "studentId", "simulationId"
    HAVING COUNT(*) > 1
  ) AS duplicates;
  IF duplicate_groups > 0 THEN
    RAISE EXCEPTION USING
      MESSAGE = format('Quiz migration blocked: %s student/activity groups contain %s IN_PROGRESS attempts.', duplicate_groups, duplicate_attempts),
      HINT = 'Review duplicate attempts and resolve them with an explicit operational decision before retrying. This migration does not delete or abandon attempts.';
  END IF;

  CREATE TYPE "ActivityKind" AS ENUM ('SIMULATION', 'QUIZ');
  ALTER TABLE "Simulation"
    ALTER COLUMN "bimester" DROP NOT NULL,
    ALTER COLUMN "assessment" DROP NOT NULL,
    ADD COLUMN "activityKind" "ActivityKind" NOT NULL DEFAULT 'SIMULATION',
    ADD COLUMN "activityKey" TEXT,
    ADD COLUMN "contentVersion" INTEGER;
  ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_activity_contract_check" CHECK (
    ("activityKind" = 'SIMULATION' AND "bimester" IS NOT NULL AND "assessment" IS NOT NULL AND "activityKey" IS NULL AND "contentVersion" IS NULL)
    OR
    ("activityKind" = 'QUIZ' AND "bimester" IS NULL AND "assessment" IS NULL AND "activityKey" IS NOT NULL AND length(btrim("activityKey")) > 0 AND "contentVersion" IS NOT NULL AND "contentVersion" > 0)
  );
  CREATE UNIQUE INDEX "Simulation_activityKey_contentVersion_key" ON "Simulation"("activityKey", "contentVersion");
  CREATE INDEX "Simulation_activityKind_status_idx" ON "Simulation"("activityKind", "status");

  ALTER TABLE "Question" ADD COLUMN "explanation" TEXT, ADD COLUMN "originKey" TEXT, ADD COLUMN "media" JSONB;
  ALTER TABLE "Attempt" ADD COLUMN "activityKey" TEXT, ADD COLUMN "contentVersion" INTEGER;
  ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_activity_version_check" CHECK (
    ("activityKey" IS NULL AND "contentVersion" IS NULL)
    OR ("activityKey" IS NOT NULL AND length(btrim("activityKey")) > 0 AND "contentVersion" IS NOT NULL AND "contentVersion" > 0)
  );
  CREATE UNIQUE INDEX "Attempt_studentId_simulationId_in_progress_key" ON "Attempt"("studentId", "simulationId") WHERE "status" = 'IN_PROGRESS';

  CREATE TABLE "AttemptQuestionSnapshot" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "originKey" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "statement" TEXT NOT NULL,
    "tip" TEXT,
    "funFact" TEXT,
    "explanation" TEXT NOT NULL,
    "media" JSONB,
    "points" DECIMAL(6,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "options" JSONB NOT NULL,
    "officialAnswers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttemptQuestionSnapshot_pkey" PRIMARY KEY ("id")
  );
  CREATE UNIQUE INDEX "AttemptQuestionSnapshot_attemptId_questionId_key" ON "AttemptQuestionSnapshot"("attemptId", "questionId");
  CREATE UNIQUE INDEX "AttemptQuestionSnapshot_attemptId_sortOrder_key" ON "AttemptQuestionSnapshot"("attemptId", "sortOrder");
  CREATE INDEX "AttemptQuestionSnapshot_questionId_idx" ON "AttemptQuestionSnapshot"("questionId");
  ALTER TABLE "AttemptQuestionSnapshot" ADD CONSTRAINT "AttemptQuestionSnapshot_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  ALTER TABLE "AttemptQuestionSnapshot" ADD CONSTRAINT "AttemptQuestionSnapshot_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
END;
$migration$;
