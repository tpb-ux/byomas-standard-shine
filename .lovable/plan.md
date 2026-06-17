# Observabilidade do Pipeline Determinístico

Adicionar logs estruturados, métricas por fonte/estágio e alertas para falhas no cron, parser RSS e publicador.

## 1. Schema (migração)

**Tabela `pipeline_logs`** (logs estruturados append-only)
- `id`, `created_at`, `stage` (`cron`|`fetch`|`parser`|`curator`|`publisher`), `source_id` (fk → news_sources, nullable), `source_name`, `level` (`info`|`warn`|`error`), `event` (string curto), `message`, `metadata` jsonb, `duration_ms` int, `correlation_id` uuid.
- Índices: `(stage, created_at desc)`, `(level, created_at desc)`, `(source_id, created_at desc)`, `(correlation_id)`.
- RLS: SELECT só admin; INSERT só service_role.

**Tabela `pipeline_metrics`** (contadores agregados por execução)
- `id`, `created_at`, `stage`, `source_id`, `source_name`, `items_in`, `items_ok`, `items_failed`, `items_skipped`, `duration_ms`, `correlation_id`.
- Índices: `(stage, created_at desc)`, `(source_id, created_at desc)`.
- RLS: SELECT admin; INSERT service_role.

**Tabela `pipeline_alerts`** (alertas disparados, deduplicáveis)
- `id`, `created_at`, `severity` (`warning`|`critical`), `stage`, `source_id`, `title`, `details` jsonb, `resolved_at`, `dedupe_key` (unique parcial onde `resolved_at is null`), `notified_email_at`.
- RLS: SELECT/UPDATE admin; INSERT service_role.

GRANTs padrão para `authenticated` (admin via policies) e `service_role`.

## 2. Helper compartilhado de logger

Criar `supabase/functions/_shared/logger.ts` (utilitário inline, sem deploy próprio) reutilizado por `fetch-news`, `auto-publish-articles`, `process-article-tags`, `process-external-links`, `auto-internal-linking`, `generate-sitemap`:

- `createLogger({ stage, correlationId })` → `{ info, warn, error, metric, flush }`.
- Buffera logs e faz `insert` em batch no fim da execução (uma chamada por tabela).
- Sempre loga: stage, source, event, duration, metadata estruturada (status HTTP, contagens, erro com stack).
- `metric()` grava linha em `pipeline_metrics` (items_in/ok/failed/skipped por fonte).
- `triggerAlert({ severity, dedupeKey, title, details })` insere em `pipeline_alerts` (upsert pelo dedupe_key quando aberto).

## 3. Instrumentação das edge functions

- **`fetch-news`**: logar início/fim por fonte, status HTTP, itens parseados/aceitos/duplicados/erros de parser. Alerta `critical` quando uma fonte falha N execuções seguidas (N=3) e `warning` quando 0 itens novos em 24 h.
- **`auto-publish-articles`**: logar candidatos, publicados, erros de geração/validação. Alerta `critical` quando 100 % de falhas na execução; `warning` quando fila > limiar configurável.
- **Cron heartbeat**: cada job grava 1 linha `metric` (stage=`cron`, event=`heartbeat`). Edge function nova `pipeline-health-check` (agendada a cada 15 min) verifica se há heartbeat de `fetch-news` nos últimos 15 min e de `auto-publish-articles` nos últimos 60 min — se não houver, dispara alerta `critical` e envia e-mail via Resend.

## 4. Alertas por e-mail

- Reaproveitar `RESEND_API_KEY` já configurada.
- Nova função `pipeline-alert-dispatcher` (chamada pelo health-check e por trigger Postgres `AFTER INSERT ON pipeline_alerts` via `pg_net`): envia 1 e-mail por alerta novo (não-resolved) e marca `notified_email_at`. Destinatário lido de `site_settings` (nova chave `alerts_email`).
- Dedupe: não reenvia enquanto alerta com mesmo `dedupe_key` continuar aberto.

## 5. UI admin

Nova página **`/admin/observabilidade`** (link no `AppSidebar` em "Administração"):

- **KPIs do topo**: taxa de sucesso 24 h por estágio (fetch / parser / publisher), itens processados, alertas abertos.
- **Tabela "Saúde por fonte"**: para cada `news_sources` ativa — última execução, sucesso/erro/skipped 24 h e 7 d, tempo médio, status (verde/amarelo/vermelho).
- **Gráfico de séries** (Recharts) com sucesso vs erro por hora (últimas 24 h).
- **Lista de alertas** abertos (severity, stage, fonte, título, detalhes JSON, botão "Resolver").
- **Visualizador de logs** com filtros: stage, level, source, correlation_id, intervalo; paginação.
- Realtime (`supabase.channel`) em `pipeline_alerts` para badge de contagem no sidebar.

## 6. Cron novo

```sql
SELECT cron.schedule(
  'pipeline-health-check-15min', '*/15 * * * *',
  $$ SELECT net.http_post(url:='…/functions/v1/pipeline-health-check', …) $$
);
```

## Detalhes técnicos

- Sem nenhum uso de IA — mantém a constraint "No AI" do projeto.
- Todas as queries Supabase em hooks usam `.maybeSingle()` onde aplicável.
- Logger nunca lança: erros de insert vão para `console.error` para não quebrar o pipeline observado.
- Retenção: cron diário `DELETE FROM pipeline_logs WHERE created_at < now() - interval '30 days'` (e 90 dias para `pipeline_metrics`).
- Tokens visuais: cards usam `bg-primary/20` translúcido para destaques (memória de identidade visual).

## Arquivos a criar/editar

- Migração: tabelas + GRANTs + RLS + cron novo + job de retenção.
- `supabase/functions/_shared/logger.ts` (novo).
- `supabase/functions/pipeline-health-check/index.ts` (novo).
- `supabase/functions/pipeline-alert-dispatcher/index.ts` (novo).
- Instrumentar `fetch-news`, `auto-publish-articles`, `process-article-tags`, `process-external-links`, `auto-internal-linking`.
- `src/pages/admin/Observability.tsx` (novo) + hooks `useObservability.ts`.
- `src/App.tsx`, `src/components/layout/AppSidebar.tsx` (rota + link + badge realtime).
