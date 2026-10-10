# Estado do Projeto — simulados-bernardo-api

> Atualizado em: 2026-10-09
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

**488 arquivos** em `prisma/seed-data/` — **492 simulados, ~14.760 questões** (último dry-run em 2026-10-09).

### Ensino Fundamental I (1º ao 5º ano)

Disciplinas: Ciências, Geografia, História, Matemática, Português — **todos os bimestres AV1+AV2 de todos os anos**.

| Série | Arquivos | Status |
|---|---|---|
| 1º ano | 40 | ✅ Completo |
| 2º ano | 40 | ✅ Completo |
| 3º ano | 40 | ✅ Completo |
| 4º ano | 40 | ✅ Completo |
| 5º ano | 40 | ✅ Completo |

### Ensino Fundamental II (6º ao 9º ano)

Disciplinas: Arte, Ciências, Ed. Física, Geografia, História, Inglês, Matemática, Português — **todos os bimestres AV1+AV2 de todos os anos**.

| Série | Arquivos | Status |
|---|---|---|
| 6º ano | 64 | ✅ Completo |
| 7º ano | 64 | ✅ Completo |
| 8º ano | 64 | ✅ Completo |
| 9º ano | 64 | ✅ Completo |

### Outros

| Segmento | Cobertura | Status |
|---|---|---|
| Educação Infantil | Infantil 4 e 5 (todos os campos BNCC) | ✅ Completo |
| Enfermagem | Curso técnico (formato `topic`, sem bimestre) | ✅ Presente |

**Convenção de branch para novo simulado:** `feat/{disciplina-curta}-{ano}ano-b{bimestre}av{avaliacao}`

---

## Próximas iniciativas

### 1. Integração front-end / API (prioridade alta)

Spec: `docs/superpowers/specs/2026-08-12-integracao-frontend-api-design.md`
Plano: `docs/superpowers/plans/2026-08-12-integracao-frontend-api-plan.md`

Escopo: login/registro, listagem de simulados via API, tentativa com correção no servidor, resultado e histórico. O frontend funcionará como BFF (proxy server-side com cookies httpOnly).

Gap de backend identificado na spec: endpoint `GET /attempts/:id/questions` (questões de uma tentativa em andamento, sem gabarito) — ainda não implementado.

### 2. Recuperação de senha

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
