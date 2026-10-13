import {
  readSkillCatalog,
  skillCatalogInventory,
  SkillCatalogError,
} from './learning-skill-catalog';

async function main() {
  const skills = readSkillCatalog();
  const inventory = skillCatalogInventory(skills);
  if (process.env.SEED_SKILLS_IMPORT_DRAFTS !== 'true') {
    if (process.env.SEED_REPORT_FORMAT === 'json')
      console.log(JSON.stringify(inventory, null, 2));
    else
      console.log(
        `Habilidades propostas: ${inventory.skills}; perguntas classificadas: ${inventory.classifiedQuestions}; faixas: ${inventory.coverage.length}; pendentes: ${inventory.pending}; aprovadas: ${inventory.approved}. Sem conexão ao banco ou publicação.`,
      );
    return;
  }
  const authorEmail = process.env.SKILL_SEED_AUTHOR_EMAIL;
  if (!authorEmail)
    throw new SkillCatalogError(
      'Configure SKILL_SEED_AUTHOR_EMAIL com um ADMIN ativo existente.',
    );
  const { PrismaClient } = await import('@prisma/client');
  const { importSkillDrafts } = await import('./learning-skill-import');
  const prisma = new PrismaClient({ log: [] });
  try {
    console.log(
      JSON.stringify(await importSkillDrafts(prisma, skills, authorEmail)),
    );
  } finally {
    await prisma.$disconnect();
  }
}
if (require.main === module)
  void main().catch((error: unknown) => {
    console.error(
      error instanceof SkillCatalogError
        ? error.message
        : 'Não foi possível preparar habilidades.',
    );
    process.exitCode = 1;
  });
