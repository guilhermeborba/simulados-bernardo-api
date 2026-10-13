import { currentMissionWeek, missionDraftInventory } from "./mission-catalog";

try {
  const inventory = missionDraftInventory(
    process.env.MISSION_WEEK_START || currentMissionWeek(),
  );
  if (process.env.SEED_REPORT_FORMAT === "json")
    console.log(JSON.stringify(inventory, null, 2));
  else {
    console.log(
      `Rascunhos validados: ${inventory.missionCount} missões, ${inventory.audiences} públicos, semana ${inventory.weekStart}.`,
    );
    console.log(
      "Curadoria proposta e revisão PENDING. Nenhuma conexão ao banco, importação ou publicação.",
    );
  }
} catch {
  console.error(
    "Não foi possível validar os rascunhos. Informe MISSION_WEEK_START como uma segunda-feira YYYY-MM-DD e confira o catálogo de quizzes.",
  );
  process.exitCode = 1;
}
