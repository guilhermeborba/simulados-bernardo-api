import 'reflect-metadata';
import {
  readQuizCatalog,
  quizCatalogInventory,
  QuizCatalogError,
} from './quiz-catalog';

async function main() {
  const catalog = readQuizCatalog();
  const inventory = quizCatalogInventory(catalog);
  if (
    process.env.SEED_QUIZZES_INVENTORY === 'true' ||
    process.env.SEED_QUIZZES_DRY_RUN === 'true'
  ) {
    if (process.env.SEED_REPORT_FORMAT === 'json')
      console.log(JSON.stringify(inventory, null, 2));
    else {
      console.log(
        `Catálogo validado: ${inventory.quizzes} quizzes, ${inventory.questions} questões, ${inventory.coverage.length} públicos.`,
      );
      console.log(
        `Revisão editorial: ${inventory.pending} pendentes e ${inventory.approved} aprovados.`,
      );
      for (const entry of inventory.coverage)
        console.log(
          `Ano ${entry.schoolYear}: ${entry.quizzes} quizzes / ${entry.questions} questões.`,
        );
      console.log(
        'Validação concluída sem conectar ao banco ou importar conteúdo.',
      );
    }
    return;
  }
  const authorEmail = process.env.QUIZ_SEED_AUTHOR_EMAIL;
  if (!authorEmail)
    throw new QuizCatalogError(
      'Configure QUIZ_SEED_AUTHOR_EMAIL com um ADMIN ativo existente.',
    );
  const { PrismaClient } = await import('@prisma/client');
  const { importQuizCatalog } = await import('./quiz-catalog-import');
  const prisma = new PrismaClient({ log: [] });
  try {
    const result = await importQuizCatalog(prisma, catalog, {
      authorEmail,
      bootstrapLatestVersions: true,
      publishReviewed: process.env.SEED_QUIZZES_PUBLISH_REVIEWED === 'true',
    });
    console.log(
      `Importação de quizzes concluída: ${result.created} criados, ${result.unchanged} preservados, ${result.published} publicados.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}
if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(
      error instanceof QuizCatalogError
        ? error.message
        : 'Não foi possível validar ou importar o catálogo de quizzes.',
    );
    process.exitCode = 1;
  });
}
