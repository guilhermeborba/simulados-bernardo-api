-- "Você sabia?": curiosidade da questão, mostrada na tela de resultado
-- independente de acerto ou erro. Não confundir com "tip", que é a dica
-- (mostrada condicionalmente: só ao errar no Fundamental, sob demanda na
-- Educação Infantil).
ALTER TABLE "Question" ADD COLUMN "funFact" TEXT;
