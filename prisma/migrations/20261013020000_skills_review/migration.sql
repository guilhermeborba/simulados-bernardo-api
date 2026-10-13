CREATE TYPE "AttemptPracticeMode" AS ENUM ('NORMAL', 'REVIEW');
CREATE TYPE "LearningSkillStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
ALTER TABLE "Attempt" ADD COLUMN "practiceMode" "AttemptPracticeMode" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_review_identity_check" CHECK ("practiceMode" = 'NORMAL' OR ("activityKey" IS NOT NULL AND "contentVersion" IS NOT NULL));
DROP INDEX "Attempt_studentId_simulationId_in_progress_key";
CREATE UNIQUE INDEX "Attempt_studentId_simulationId_mode_in_progress_key" ON "Attempt"("studentId", "simulationId", "practiceMode") WHERE "status" = 'IN_PROGRESS';
CREATE INDEX "Attempt_studentId_status_practiceMode_idx" ON "Attempt"("studentId", "status", "practiceMode");
ALTER TABLE "AttemptQuestionSnapshot"
  ADD COLUMN "skillCode" TEXT,
  ADD COLUMN "skillVersion" INTEGER,
  ADD COLUMN "skillTitle" TEXT,
  ADD COLUMN "skillDisciplineSlug" TEXT,
  ADD COLUMN "skillSchoolYear" INTEGER,
  ADD COLUMN "practicedBefore" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AttemptQuestionSnapshot" ADD CONSTRAINT "AttemptQuestionSnapshot_skill_complete_check" CHECK (
  ("skillCode" IS NULL AND "skillVersion" IS NULL AND "skillTitle" IS NULL AND "skillDisciplineSlug" IS NULL AND "skillSchoolYear" IS NULL)
  OR ("skillCode" IS NOT NULL AND length(btrim("skillCode")) > 0 AND "skillVersion" IS NOT NULL AND "skillVersion" > 0 AND "skillTitle" IS NOT NULL AND length(btrim("skillTitle")) > 0 AND "skillDisciplineSlug" IS NOT NULL AND length(btrim("skillDisciplineSlug")) > 0 AND "skillSchoolYear" IS NOT NULL AND "skillSchoolYear" IN (-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12))
);
CREATE TABLE "LearningSkill" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "disciplineId" TEXT NOT NULL,
  "schoolYear" INTEGER NOT NULL,
  "status" "LearningSkillStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "LearningSkill_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LearningSkill_version_check" CHECK ("version" > 0),
  CONSTRAINT "LearningSkill_code_check" CHECK ("code" ~ '^[a-z0-9][a-z0-9._:-]*$' AND length("code") <= 120),
  CONSTRAINT "LearningSkill_text_check" CHECK (length(btrim("title")) > 0 AND length("title") <= 200 AND length(btrim("description")) > 0),
  CONSTRAINT "LearningSkill_year_check" CHECK ("schoolYear" IN (-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12)),
  CONSTRAINT "LearningSkill_review_check" CHECK ("status" <> 'PUBLISHED' OR ("publishedAt" IS NOT NULL AND "reviewedBy" IS NOT NULL AND length(btrim("reviewedBy")) > 0 AND "reviewedAt" IS NOT NULL)),
  CONSTRAINT "LearningSkill_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "LearningSkill_code_version_key" ON "LearningSkill"("code", "version");
CREATE INDEX "LearningSkill_disciplineId_schoolYear_status_idx" ON "LearningSkill"("disciplineId", "schoolYear", "status");
CREATE TABLE "QuestionSkill" (
  "questionId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionSkill_pkey" PRIMARY KEY ("questionId"),
  CONSTRAINT "QuestionSkill_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "QuestionSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "LearningSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "QuestionSkill_skillId_idx" ON "QuestionSkill"("skillId");
