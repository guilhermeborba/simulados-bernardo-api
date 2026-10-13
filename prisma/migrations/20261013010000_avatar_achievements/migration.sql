-- Additive cosmetic ownership; XP, grades and quiz result receipts are unchanged.
CREATE TYPE "AvatarStyle" AS ENUM ('AUTO', 'MASCOT', 'SEAL');

CREATE TABLE "UserAchievement" (
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL,
  "sourceAttemptId" TEXT,
  CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId", "achievementId"),
  CONSTRAINT "UserAchievement_catalog_check" CHECK (
    "achievementId" IN ('FIRST_QUIZ', 'THREE_TOPICS', 'FIVE_QUIZZES', 'FIRST_MISSION', 'XP_100')
  )
);

CREATE TABLE "UserAvatarItem" (
  "userId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL,
  "sourceAttemptId" TEXT,
  CONSTRAINT "UserAvatarItem_pkey" PRIMARY KEY ("userId", "itemId"),
  CONSTRAINT "UserAvatarItem_catalog_check" CHECK (
    "itemId" IN ('primeiro-passo', 'explorador', 'constancia', 'missao', 'horizonte')
  )
);

CREATE TABLE "UserAvatar" (
  "userId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL DEFAULT 'inicio',
  "style" "AvatarStyle" NOT NULL DEFAULT 'AUTO',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserAvatar_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "UserAvatar_catalog_check" CHECK (
    "itemId" IN ('inicio', 'primeiro-passo', 'explorador', 'constancia', 'missao', 'horizonte')
  )
);

CREATE INDEX "UserAchievement_sourceAttemptId_idx" ON "UserAchievement"("sourceAttemptId");
CREATE INDEX "UserAvatarItem_sourceAttemptId_idx" ON "UserAvatarItem"("sourceAttemptId");

ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_sourceAttemptId_fkey"
  FOREIGN KEY ("sourceAttemptId") REFERENCES "Attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserAvatarItem" ADD CONSTRAINT "UserAvatarItem_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAvatarItem" ADD CONSTRAINT "UserAvatarItem_sourceAttemptId_fkey"
  FOREIGN KEY ("sourceAttemptId") REFERENCES "Attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserAvatar" ADD CONSTRAINT "UserAvatar_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve Task 7 progress using real completion receipts (including zero XP).
-- Older FINISHED attempts without a receipt do not become cosmetic progress.
-- Published quiz metadata is immutable; the first receipted version wins by
-- completion instant, then attempt id. Its topic cannot multiply on new versions.
WITH logical_first AS (
  SELECT DISTINCT ON (a."studentId", a."activityKey")
    a."studentId" AS "userId", a."activityKey", a."id" AS "attemptId",
    COALESCE(a."finishedAt", r."createdAt") AS "completedAt", r."createdAt" AS "recordedAt",
    s."disciplineId",
    LOWER(BTRIM(s."topic", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF')) AS "topic"
  FROM "QuizCompletionReward" r
  JOIN "Attempt" a ON a."id" = r."attemptId"
  JOIN "Simulation" s ON s."id" = a."simulationId"
  WHERE a."status" = 'FINISHED' AND s."activityKind" = 'QUIZ' AND a."activityKey" IS NOT NULL
  ORDER BY a."studentId", a."activityKey", COALESCE(a."finishedAt", r."createdAt"), r."createdAt", a."id" COLLATE "C"
), ranked_quizzes AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY "userId" ORDER BY "completedAt", "recordedAt", "attemptId" COLLATE "C"
  ) AS ordinal
  FROM logical_first
), topic_first AS (
  SELECT DISTINCT ON ("userId", "disciplineId", "topic") *
  FROM logical_first WHERE "topic" IS NOT NULL AND "topic" <> ''
  ORDER BY "userId", "disciplineId", "topic", "completedAt", "recordedAt", "attemptId" COLLATE "C"
), ranked_topics AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY "userId" ORDER BY "completedAt", "recordedAt", "attemptId" COLLATE "C"
  ) AS ordinal FROM topic_first
), mission_first AS (
  SELECT DISTINCT ON ("userId") "userId", "completedAt"
  FROM "MissionProgress" WHERE "completedAt" IS NOT NULL
  ORDER BY "userId", "completedAt", "id" COLLATE "C"
), xp_running AS (
  SELECT *, SUM("amount") OVER (
    PARTITION BY "userId" ORDER BY "createdAt", "id" COLLATE "C"
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS total FROM "XpEvent"
), xp_first AS (
  SELECT DISTINCT ON ("userId") * FROM xp_running WHERE total >= 100
  ORDER BY "userId", "createdAt", "id" COLLATE "C"
), grants AS (
  SELECT "userId", 'FIRST_QUIZ' AS "achievementId", "completedAt" AS "earnedAt", "attemptId" AS "sourceAttemptId"
  FROM ranked_quizzes WHERE ordinal = 1
  UNION ALL
  SELECT "userId", 'FIVE_QUIZZES', "completedAt", "attemptId" FROM ranked_quizzes WHERE ordinal = 5
  UNION ALL
  SELECT "userId", 'THREE_TOPICS', "completedAt", "attemptId" FROM ranked_topics WHERE ordinal = 3
  UNION ALL
  SELECT "userId", 'FIRST_MISSION', "completedAt", NULL::TEXT FROM mission_first
  UNION ALL
  SELECT "userId", 'XP_100', "createdAt", "attemptId" FROM xp_first
)
INSERT INTO "UserAchievement" ("userId", "achievementId", "earnedAt", "sourceAttemptId")
SELECT "userId", "achievementId", "earnedAt", "sourceAttemptId" FROM grants
ON CONFLICT ("userId", "achievementId") DO NOTHING;

INSERT INTO "UserAvatarItem" ("userId", "itemId", "unlockedAt", "sourceAttemptId")
SELECT "userId", CASE "achievementId"
  WHEN 'FIRST_QUIZ' THEN 'primeiro-passo'
  WHEN 'THREE_TOPICS' THEN 'explorador'
  WHEN 'FIVE_QUIZZES' THEN 'constancia'
  WHEN 'FIRST_MISSION' THEN 'missao'
  WHEN 'XP_100' THEN 'horizonte'
END, "earnedAt", "sourceAttemptId" FROM "UserAchievement"
ON CONFLICT ("userId", "itemId") DO NOTHING;
