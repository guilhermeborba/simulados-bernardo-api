-- Ranking da turma só conta tentativas finalizadas a partir desta data.
-- Nulo = conta o histórico inteiro. Existe para zerar a régua quando colegas
-- novos entram numa turma que já tem gente adiantada.
ALTER TABLE "Turma" ADD COLUMN "rankingCountsFrom" TIMESTAMP(3);
