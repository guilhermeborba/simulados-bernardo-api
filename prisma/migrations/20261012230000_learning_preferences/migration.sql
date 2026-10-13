-- Add personal preferences without changing existing users or profiles.
CREATE TYPE "LearningSegment" AS ENUM ('INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO', 'ENFERMAGEM');

CREATE TABLE "LearningPreferences" (
    "userId" TEXT NOT NULL,
    "segment" "LearningSegment",
    "schoolYear" INTEGER,
    "audioEnabled" BOOLEAN NOT NULL DEFAULT false,
    "motionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearningPreferences_pkey" PRIMARY KEY ("userId"),
    CONSTRAINT "LearningPreferences_segment_schoolYear_check" CHECK ((
      ("segment" IS NULL AND "schoolYear" IS NULL)
      OR ("segment" IS NOT NULL AND "schoolYear" IS NULL)
      OR ("segment" = 'INFANTIL' AND "schoolYear" IN (-1, -2))
      OR ("segment" = 'FUNDAMENTAL_I' AND "schoolYear" BETWEEN 1 AND 5)
      OR ("segment" = 'FUNDAMENTAL_II' AND "schoolYear" BETWEEN 6 AND 9)
      OR ("segment" = 'MEDIO' AND "schoolYear" BETWEEN 10 AND 12)
      OR ("segment" = 'ENFERMAGEM' AND "schoolYear" = 0)
    ) IS TRUE)
);

ALTER TABLE "LearningPreferences" ADD CONSTRAINT "LearningPreferences_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
