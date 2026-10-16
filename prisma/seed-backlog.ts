/**
 * Backlog editorial registrado em 2026-10-12. A presença de um arquivo NÃO
 * promove uma entrada: remover seu registro exige revisão editorial e dry-run.
 * Metadados completos permanecem em seed.ts. Ver docs/inventario-acervo.md.
 */
export interface SeedBacklogEntry {
  file: string;
  trackingId: string;
  reason: string;
}

const filesAwaitingContent: string[] = [];

export const seedBacklog: SeedBacklogEntry[] = filesAwaitingContent.map(
  (file) => ({
    file,
    trackingId: `acervo:${file.replace(/\.ts$/, '')}`,
    reason:
      'Expansão do Ensino Médio: conteúdo ausente na main em 2026-10-12; aguarda autoria e revisão editorial.',
  }),
);
