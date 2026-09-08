-- Eixo temático do simulado. Nulo na educação básica, onde a navegação é por
-- ano/bimestre/avaliação; preenchido no curso técnico, que não tem bimestre.
ALTER TABLE "Simulation" ADD COLUMN "topic" TEXT;

CREATE INDEX "Simulation_disciplineId_topic_idx" ON "Simulation"("disciplineId", "topic");
