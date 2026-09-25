# Estado do Projeto — simulados-bernardo-api

> Atualizado em: 2026-09-25
> Atualizar este arquivo ao concluir cada fase ou iniciativa relevante.

## Status geral

O backend está **completo e pronto para produção**. As 6 fases do plano original foram implementadas. O foco atual é a expansão de conteúdo (novos simulados) e a integração com o front-end.

---

## Fases de desenvolvimento

| Fase | Título | Status |
|---|---|---|
| 1 | Fundação do backend | ✅ Concluída |
| 2 | Autenticação e usuários | ✅ Concluída |
| 3 | Disciplinas, simulados e questões | ✅ Concluída |
| 4 | Tentativas e correção | ✅ Concluída |
| 5 | Perfil e relatórios | ✅ Concluída |
| 6 | Segurança, hardening e produção | ✅ Concluída |

Pendências menores (não bloqueantes para produção):

- `POST /auth/forgot-password` + `POST /auth/reset-password` (recuperação de senha) — especificado, não implementado
- Restrição de professor a turmas autorizadas — professor existe como role mas sem controle de acesso a alunos específicos
- Testes de integração e e2e — cobertura unitária existe nos services críticos; integração pendente

---

## Conteúdo de simulados

**169 arquivos** em `prisma/seed-data/`. Cobertura por disciplina:

| Disciplina | Anos cobertos | Observações |
|---|---|---|
| Matemática | 1º ao 4º ano (todos os bimestres AV1+AV2) | Completo |
| Português | 1º ao 3º ano completo; 4º ano parcial (B1AV1 apenas) | 4º ano em andamento |
| Geografia | 1º ao 4º ano (todos os bimestres AV1+AV2) | Completo |
| História | 1º ao 3º ano (todos os bimestres AV1+AV2) | 4º ano ausente |
| Ciências | 1º ao 3º ano (todos os bimestres AV1+AV2) | 4º ano ausente |
| Educação Infantil | Infantil 4 e 5 (todos os campos BNCC) | Completo |
| Enfermagem | Curso técnico | Presente (formato `topic`, sem bimestre) |

**Convenção de branch para novo simulado:** `feat/{disciplina-curta}-{ano}ano-b{bimestre}av{avaliacao}`

---

## Próximas iniciativas

### 1. Integração front-end / API (prioridade alta)

Spec: `docs/superpowers/specs/2026-08-12-integracao-frontend-api-design.md`
Plano: `docs/superpowers/plans/2026-08-12-integracao-frontend-api-plan.md`

Escopo: login/registro, listagem de simulados via API, tentativa com correção no servidor, resultado e histórico. O frontend funcionará como BFF (proxy server-side com cookies httpOnly).

Gap de backend identificado na spec: endpoint `GET /attempts/:id/questions` (questões de uma tentativa em andamento, sem gabarito) — ainda não implementado.

### 2. Conteúdo faltante — 4º ano

- Português 4º ano: B1AV2, B2, B3, B4 (8 simulados)
- História 4º ano: todos os bimestres (8 simulados)
- Ciências 4º ano: todos os bimestres (8 simulados)

### 3. Recuperação de senha

Endpoints planejados mas não implementados: `POST /auth/forgot-password` e `POST /auth/reset-password`. Requer envio de e-mail — decidir provider antes de implementar.

---

## Infraestrutura

- **Deploy:** Railway (ver `docs/guia-deploy.md` e `.railway/`)
- **Banco:** PostgreSQL (Docker localmente, Railway em produção)
- **CI:** não configurado
- **Swagger:** `GET /docs` (habilitar com `API_DOCS_ENABLED=true`)

---

## Decisões arquiteturais registradas

Ver `docs/decisions/` para o raciocínio por trás das escolhas não óbvias do projeto.
