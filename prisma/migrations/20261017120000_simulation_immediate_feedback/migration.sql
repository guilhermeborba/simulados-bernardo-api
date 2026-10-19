-- Additive opt-in: existing attempts retain their original deferred behavior.
ALTER TABLE "Attempt" ADD COLUMN "immediateFeedback" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Question" ADD COLUMN "theme" TEXT;
ALTER TABLE "AttemptQuestionSnapshot" ADD COLUMN "theme" TEXT;
