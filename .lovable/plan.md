## Validação do pipeline em produção — resultados

### ✅ Sem IA no código-fonte
`rg "LOVABLE_API_KEY|ai.gateway|gemini|openai"` em `src/` e `supabase/functions/` → **0 resultados**. Refactor de Sprint 0 está aplicado no repositório.

### ✅ Cron de 5 min funcionando
| jobid | nome | schedule | última execução | status |
|---|---|---|---|---|
| 21 | `fetch-news-every-5min` | `*/5 * * * *` | 01:00:00 | succeeded (a cada 5 min consistentemente) |
| 22 | `auto-publish-every-30min` | `*/30 * * * *` | 01:00:00 | succeeded |

`fetch-news` rodou às 01:00 e processou todas as 15 fontes ativas (`last_fetched_at` atualizado). `curated_news` tem 4.320 registros (score médio 69).

### 🔴 Problemas encontrados

**1. `auto-publish-articles` deployado está DESATUALIZADO (crítico)**
Logs ao vivo (01:00:02): `Article generation failed: 402` × 3 → 0 publicados.
O código local NÃO contém mais essa string nem chamadas de IA, mas a versão deployada ainda tenta o Gemini e bate em quota. **A função precisa ser re-deployada.** Último artigo publicado: 17/05 12:15 (mais de 12h sem publicar).

**2. Crons legados redundantes**
Jobs 1–20 ainda existem (`fetch-news-05h`, `08h`, `12h`, …, `publish-articles-05h15`, …). Eles disparam as mesmas funções em horários fixos, sobrepondo o cron de 5 min/30 min. Devem ser desativados para evitar duplicidade e gasto de quota.

**3. 9 fontes RSS falhando**
| Fonte | HTTP | Causa provável |
|---|---|---|
| UNFCCC News | 0 itens | feed retorna vazio |
| IEA News | 403 | bloqueio de User-Agent |
| ICAP | 404 | URL inválida |
| Reuters Sustainable Business | 404 | URL antiga |
| AP Climate | 404 | URL removida |
| Observatório do Clima | 403 | bloqueio de User-Agent |
| Environmental Finance | 404 | URL inválida |
| Valor ESG | 404 | URL inválida |
| GreenBiz | 0 itens | feed vazio |

Pipeline ingere apenas de: Carbon Pulse, Carbon Brief, Climate Home, Mongabay, MapBiomas, ((o))eco (6 ativas). Ainda assim, 10 itens novos por fonte por ciclo — última leva foi 100% duplicada (esperado, fontes não publicaram nada novo nos últimos minutos).

**4. Métrica "novidade" zerada**
0 novos itens na última hora — não é bug do código, é reflexo de (a) fontes quebradas e (b) feeds saturados. Será resolvido ao corrigir URLs.

---

## Ações propostas (correções mínimas, sem novas features)

### Sprint de validação (1 PR)
1. **Re-deployar `auto-publish-articles`** com o código atual (sem IA) — resolve o 402 e destrava as publicações.
2. **Desativar crons legados** (jobids 1–20) via `cron.unschedule`, mantendo apenas `fetch-news-every-5min` e `auto-publish-every-30min`.
3. **Corrigir/remover RSS quebrados**:
   - Atualizar URLs: ICAP, Reuters, AP Climate, Valor ESG, Environmental Finance, GreenBiz para feeds válidos atuais.
   - Para feeds que bloqueiam por UA (IEA, Observatório do Clima): trocar User-Agent para `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36` no `fetch-news`.
   - Desativar (`is_active=false`) Bloomberg Green e Reuters Sustainability (sem RSS).
4. **Adicionar tela admin "Jobs & Cron"** lendo `cron.job` e `cron.job_run_details` via RPC `security definer` — para você monitorar saúde do pipeline sem SQL.
5. **Dashboard de métricas** no admin: itens coletados/hora, taxa de duplicatas, score médio, publicações últimas 24h, fontes com falha 3× consecutivas.

### Critérios de aceite
- `cron.job_run_details` mostra apenas 2 jobs ativos (5 min e 30 min) → ✅
- Logs de `auto-publish-articles` não contêm "402" nem "Article generation failed" por 1h → ✅
- `curated_news` cresce em pelo menos 1 fonte/hora → ✅
- Pelo menos 1 artigo passa de `draft` para `published` no próximo ciclo de 30 min → ✅

---

Aprovar para eu executar essa sprint de validação?
