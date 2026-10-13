-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuizRewardReason" AS ENUM ('AWARDED', 'ALREADY_REWARDED', 'DAILY_LIMIT');

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizCompletionReward" (
    "attemptId" TEXT NOT NULL,
    "xpAwarded" INTEGER NOT NULL,
    "reason" "QuizRewardReason" NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizCompletionReward_pkey" PRIMARY KEY ("attemptId")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "segment" "LearningSegment" NOT NULL,
    "schoolYear" INTEGER NOT NULL,
    "turmaId" TEXT,
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "slot" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionActivity" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "MissionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionActivityCompletion" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "missionActivityId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionActivityCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XpEvent_attemptId_key" ON "XpEvent"("attemptId");

-- CreateIndex
CREATE INDEX "XpEvent_userId_day_idx" ON "XpEvent"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "XpEvent_userId_activityKey_day_key" ON "XpEvent"("userId", "activityKey", "day");

-- CreateIndex
CREATE INDEX "Mission_status_startsAt_endsAt_schoolYear_idx" ON "Mission"("status", "startsAt", "endsAt", "schoolYear");

-- CreateIndex
CREATE INDEX "Mission_turmaId_idx" ON "Mission"("turmaId");

-- CreateIndex
CREATE INDEX "MissionActivity_activityKey_idx" ON "MissionActivity"("activityKey");

-- CreateIndex
CREATE UNIQUE INDEX "MissionActivity_missionId_activityKey_key" ON "MissionActivity"("missionId", "activityKey");

-- CreateIndex
CREATE UNIQUE INDEX "MissionActivity_missionId_sortOrder_key" ON "MissionActivity"("missionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MissionProgress_userId_missionId_key" ON "MissionProgress"("userId", "missionId");

-- CreateIndex
CREATE INDEX "MissionActivityCompletion_attemptId_idx" ON "MissionActivityCompletion"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionActivityCompletion_progressId_missionActivityId_key" ON "MissionActivityCompletion"("progressId", "missionActivityId");

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizCompletionReward" ADD CONSTRAINT "QuizCompletionReward_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionActivity" ADD CONSTRAINT "MissionActivity_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionProgress" ADD CONSTRAINT "MissionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionProgress" ADD CONSTRAINT "MissionProgress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionActivityCompletion" ADD CONSTRAINT "MissionActivityCompletion_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "MissionProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionActivityCompletion" ADD CONSTRAINT "MissionActivityCompletion_missionActivityId_fkey" FOREIGN KEY ("missionActivityId") REFERENCES "MissionActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionActivityCompletion" ADD CONSTRAINT "MissionActivityCompletion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Exactly two curated slots per weekly audience. NULL denotes the public scope.
CREATE UNIQUE INDEX "Mission_published_weekly_slot_key"
ON "Mission" ("startsAt", "segment", "schoolYear", COALESCE("turmaId", ''), "slot")
WHERE "status" = 'PUBLISHED' AND "deletedAt" IS NULL;

ALTER TABLE "Mission" ADD CONSTRAINT "Mission_slot_check" CHECK ("slot" IN (1, 2));
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_week_window_check" CHECK (
  EXTRACT(ISODOW FROM "startsAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') = 1
  AND ("startsAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::time = '00:00:00'
  AND ("endsAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') =
      ("startsAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '7 days'
);
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_published_at_check" CHECK (
  "status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL
);
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_audience_check" CHECK (
  ("segment" = 'INFANTIL' AND "schoolYear" IN (-2, -1)) OR
  ("segment" = 'FUNDAMENTAL_I' AND "schoolYear" BETWEEN 1 AND 5) OR
  ("segment" = 'FUNDAMENTAL_II' AND "schoolYear" BETWEEN 6 AND 9) OR
  ("segment" = 'MEDIO' AND "schoolYear" BETWEEN 10 AND 12) OR
  ("segment" = 'ENFERMAGEM' AND "schoolYear" = 0)
);
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_positive_amount_check" CHECK ("amount" > 0);
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_day_check" CHECK ("day" ~ '^\d{4}-\d{2}-\d{2}$');
ALTER TABLE "QuizCompletionReward" ADD CONSTRAINT "QuizCompletionReward_receipt_check" CHECK (
  ("reason" = 'AWARDED' AND "xpAwarded" > 0) OR
  ("reason" <> 'AWARDED' AND "xpAwarded" = 0)
);
ALTER TABLE "QuizCompletionReward" ADD CONSTRAINT "QuizCompletionReward_day_check" CHECK ("day" ~ '^\d{4}-\d{2}-\d{2}$');
