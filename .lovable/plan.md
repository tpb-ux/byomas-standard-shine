# Auditoria End-to-End — Portal de Notícias (Byoma / Amazonia Research)

> Diretriz central da auditoria: **remoção total de IA** (sem `LOVABLE_API_KEY`, sem chamadas a `ai.gateway.lovable.dev`, sem Gemini/OpenAI) e **custo zero de IA**. Toda curadoria/publicação passa a ser **RSS → curadoria automática determinística → republicação com atribuição** + edição manual no admin, com cron de **5 em 5 minutos**, mantendo SEO/AEO/GEO/EEAT no estado-da-arte.

---

## 1. Mapeamento das fontes RSS (estado atual no banco)

9 fontes ativas em `news_sources`, **7 com RSS válido** e 2 sem RSS (não entram na automação):

| Fonte | Categoria | RSS | Status |
|---|---|---|---|
| Carbon Pulse | carbon | `https://carbon-pulse.com/feed/` | OK |
| Carbon Brief | carbon | `https://www.carbonbrief.org/feed/` | OK |
| Climate Home News | carbon | `https://www.climatechangenews.com/feed/` | OK |
| Environmental Finance | carbon | `https://www.environmental-finance.com/rss` | OK (paywall parcial) |
| Mongabay Brasil | carbon | `https://brasil.mongabay.com/feed/` | OK |
| GreenBiz | sustainability | `https://www.greenbiz.com/rss.xml` | OK |
| Valor Econômico – ESG | sustainability | `https://valor.globo.com/esg/rss.xml` | OK (paywall) |
| Bloomberg Green | sustainability | — | **Sem RSS** (não coleta) |
| Reuters Sustainability | sustainability | — | **Sem RSS** (não coleta) |

Fontes recomendadas a adicionar (gratuitas, alto EEAT): Reuters Sustainable Business (`https://www.reutersagency.com/feed/?best-topics=sustainable-business`), AP Climate, UNFCCC News, IEA News, World Bank Climate, ICAP, IETA, Ember, BloombergNEF (newsletter), CDP, MapBiomas, Observatório do Clima, ((o))eco, ClimaInfo, Capital Reset, Página 22, Um Só Planeta.

---

## 2. Verificação de rotas e páginas (conformidade editorial)

Todas as 50+ rotas em `src/App.tsx` carregam (lazy + Suspense). Pontos relevantes ao editorial:

- `/` `/blog` `/blog/:slug` `/topico/:slug` `/tag/:slug` `/tags` `/guias` `/guia/:slug` `/glossario` `/glossario/:slug` — OK
- `/sobre` `/contato` `/privacidade` `/termos` — OK (EEAT base)
- **Falta:** `/autores/:slug`, `/sitemap-news.xml` (Google News), `/feed.xml` (RSS próprio), `/correcoes` (política), `/equipe-editorial`, `/principios-editoriais`, `/metodologia`, `/fontes` — críticos para EEAT/Google News.
- Admin: cobertura completa (artigos, curadoria, automação, fontes, SEO, performance, etc.). Falta uma tela de **"Fila de Curadoria"** simplificada sem IA e tela de **"Cron / Jobs"** visível ao admin.

---

## 3. Status por bloco — o que está e o que falta

### 3.1 ✅ 100% implementado e funcional
- Esquema do banco completo: `articles`, `categories`, `tags`, `news_sources`, `curated_news`, `pillar_pages`, `topic_clusters`, `glossary_terms`, `internal_links`, `external_links`, `seo_metrics`, `authors`, `profiles`, `user_roles`, `contact_messages`, `newsletter_subscribers`, `web_vitals_metrics`, `search_console_data`, `cta_clicks`, `user_reading_history`.
- RLS habilitada em todas as tabelas com `has_role()` (security definer) — padrão correto.
- Roles em tabela separada (`user_roles` + enum `app_role`) — sem privilege escalation.
- Auth com signup/login (sem anon), profile auto-via trigger `handle_new_user`.
- Triggers/Funções: `calculate_seo_metrics`, `recalculate_all_seo_metrics`, `increment_article_views`, `increment_pillar_views`.
- Sitemap dinâmico (edge `generate-sitemap`), `robots.txt`, `SEOHead` com OG/Twitter/Schema (Article, Organization, Breadcrumb, FAQ, HowTo, DefinedTerm).
- Web Vitals coletados (`web_vitals_metrics`).
- Lazy-loading de rotas, React Query, Helmet async.
- Página de Perfil `/perfil` + dashboard estudante `/minha-conta` + ranking + certificados.

### 3.2 🟠 Parcialmente implementado (falta para 100%)
- **Coleta RSS (`fetch-news`)**: funcional mas usa Gemini para `engagement_potential`. Falta: remoção da IA, fallback 100% determinístico, fontes Bloomberg/Reuters sem RSS, dedupe por hash de URL/título, captura de imagem da matéria (og:image), parser RSS/Atom mais robusto, suporte a `<media:content>` / `<enclosure>`.
- **Cron**: extensões `pg_cron` e `pg_net` instaladas, mas **não há job agendado** para `fetch-news` a cada 5 min. `auto-publish-articles` também não tem cron declarado.
- **Sitemap**: edge function existe mas **não há `sitemap-news.xml`** (Google News exige um sitemap próprio com `<news:news>`, janela 48h).
- **SEO técnico**: `SEOHead` ótimo, mas Helmet só roda no cliente — crawlers sociais (LinkedIn/Slack/Facebook) leem só `index.html`. Falta SSR ou pré-render para per-route OG/canonical.
- **`robots.txt`**: aponta para `https://byomaresearch.com/sitemap.xml` — domínio errado vs. `amazonia.news` / `amazoniaresearch.com`. Inconsistência de canonical entre `SEOHead` (`amazoniaresearch.com`) e domínio publicado (`amazonia.news`).
- **EEAT**: Authors existe na tabela mas sem páginas `/autores/:slug`; artigos não exibem bio do autor; sem schema `Person` com `sameAs`.
- **Indexação Google**: integração Search Console (`fetch-search-console`) existe; falta automação de verificação META, submissão de sitemap, e IndexNow para Bing.
- **Auto-publish**: 100% dependente de IA (Gemini gera artigo + imagem). Precisa virar **republicação ética** (resumo extrativo + link canonical para fonte + reescrita opcional manual).

### 3.3 🔴 Precisa ser implementado do zero (sem IA)
1. **Pipeline editorial sem IA**:
   - Parser RSS/Atom robusto (deno-dom) com extração de `title`, `link`, `pubDate`, `description`, `content:encoded`, `media:content`, `enclosure`, `og:image` via fetch da página origem.
   - Scoring de engajamento **determinístico**: pesos por (fonte trust_score, presença de keywords trending na tabela, frescor temporal, novelty vs. já publicado, presença de imagem).
   - Tagging automático **baseado em dicionário** (keywords → tags da tabela `tags`) — sem LLM.
   - Internal linking **baseado em similaridade de keywords e categoria** (tsvector/trigram do Postgres) — sem LLM.
   - External linking **baseado em `authority_sources`** + extração de domínios do conteúdo original.
   - Imagem de capa: usar `og:image` da origem, com fallback para banco `fallback_images` por categoria (sem geração IA).
   - Sumarização: **extrativa** (TextRank/posição/keyword) em Deno puro — não generativa.
2. **Cron `pg_cron` 5/5 min** para `fetch-news` e cron horário para `auto-publish-articles` (versão sem IA).
3. **`sitemap-news.xml`** dinâmico (últimas 48h).
4. **Feed RSS próprio** (`/feed.xml`) — sustenta backlinks e EEAT.
5. **Páginas EEAT**: `/equipe-editorial`, `/principios-editoriais`, `/metodologia`, `/politica-de-correcoes`, `/fontes`, `/autores/:slug` + schema `Person`/`NewsMediaOrganization`.
6. **Schema `NewsArticle`** (não só `Article`) com `dateline`, `articleSection`, `printSection`, `author.Person`, `publisher.NewsMediaOrganization`.
7. **IndexNow** (Bing/Yandex) — ping a cada artigo publicado.
8. **AEO/GEO**: blocos "Resposta Direta" (já existe `DirectAnswer`) + FAQ schema em todo artigo + dados geográficos (`geotags` já existe mas subutilizado).
9. **Tela admin "Fila de Curadoria"** sem IA: aprovar / reescrever / publicar / rejeitar.
10. **Tela admin "Jobs & Cron"** mostrando status dos crons `pg_cron`.

### 3.4 🛠️ Precisa ser corrigido (bugs / inconsistências)
- `fetch-news`: `from("curated_news").select("id").eq("original_url", ...).single()` → quando não há registro retorna erro PGRST116; trocar por `.maybeSingle()`.
- `robots.txt` com domínio `byomaresearch.com` errado.
- `sitemap.xml` estático em `public/` com domínio `amazoniaresearch.com` em conflito com o publicado `amazonia.news` e com o sitemap dinâmico da edge `generate-sitemap` — definir **uma só fonte de verdade**.
- `SEOHead.BASE_URL` hard-coded como `https://amazoniaresearch.com` — externalizar via `site_settings` ou env.
- Edge `fetch-news` faz dedupe via `.single()` dentro de loop (N+1 + erro silencioso) — usar índice único em `curated_news.original_url` + `ON CONFLICT DO NOTHING`.
- Não há índice único em `curated_news.original_url` nem em `articles.slug` checado — confirmar.
- `Helmet` per-route + `<link rel="canonical">` em `index.html` → risco de canonical duplicado.
- Edge functions com IA continuam deployadas e mantêm dependência de `LOVABLE_API_KEY` (custo). Remover: `generate-article`, `generate-image`, `analyze-seo-article`, `fix-missing-images`, partes de IA em `auto-publish-articles`, `process-article-tags`, `fetch-news`.
- Páginas admin que invocam essas functions (`GenerateArticle`, `Automation`, `ArticleSEO` — aba IA, `Curator`) precisam de refactor para remover botões/fluxos de IA.

### 3.5 ⚡ Pontos de melhoria
- **Performance**: pré-render estático das rotas críticas (Index/Blog/Post) via `vite-plugin-ssg` ou migração para Next/Astro (decisão produto).
- **Imagens**: pipeline WebP/AVIF + `srcset` + LQIP; storage `article-images` já existe.
- **Cache**: HTTP cache headers nos endpoints de leitura + SWR no front (já tem React Query).
- **Acessibilidade**: auditar contraste do tema `#36454F` em modo escuro.
- **Observabilidade**: dashboard de erros das edge functions (já existe `Performance` page — expandir).
- **i18n**: portal multinacional → adicionar `hreflang` PT/EN/ES se houver intenção multi-idioma.
- **Newsletter**: usar Resend (já configurado) com double opt-in e templates de digest diário.

---

## 4. Sprints executáveis (priorizadas)

### Sprint 0 — Remoção de IA e custo zero (0,5 semana, P0)
1. Excluir edge functions: `generate-article`, `generate-image`, `analyze-seo-article`, `fix-missing-images`.
2. Refatorar `fetch-news`: remover bloco `analyzeEngagement` com Gemini, manter apenas scoring determinístico.
3. Refatorar `auto-publish-articles`: remover geração de conteúdo/imagem por IA; transformar em "promotor" — pega `curated_news` com score ≥ X, cria `articles` em status `draft` com excerto extrativo + link canonical à fonte original.
4. Refatorar `process-article-tags`: usar apenas dicionário de keywords (sem LLM).
5. Remover botões/abas de IA em `admin/GenerateArticle`, `admin/Automation`, `admin/ArticleSEO`, `admin/Curator`, `admin/seo/AISuggestions`.
6. Remover secret `LOVABLE_API_KEY` dos fluxos (mantém no projeto se outro uso existir).

**Critério de aceite**: `rg "ai.gateway.lovable|LOVABLE_API_KEY|gemini|openai"` retorna 0 resultados em `supabase/functions/` e `src/`.

### Sprint 1 — Cron 5min + governança de fontes (0,5 semana, P0)
1. Agendar `pg_cron`:
   - `fetch-news` a cada 5 min.
   - `auto-publish-articles` (versão sem IA) a cada 30 min.
   - `generate-sitemap` + `sitemap-news` 1x/hora.
2. Adicionar índice único `curated_news.original_url` + `ON CONFLICT DO NOTHING`.
3. Adicionar RSS faltantes: Reuters, AP Climate, UNFCCC, IEA, ICAP, IETA, MapBiomas, Observatório do Clima, ((o))eco.
4. Tela admin "Jobs & Cron" lendo `cron.job_run_details` via RPC security definer.

### Sprint 2 — Parser RSS robusto + republicação ética (1 semana, P0)
1. Substituir regex de RSS por `deno-dom` (Atom + RSS 2.0 + media namespace).
2. Extrair `og:image` da página origem (fetch + parse).
3. Sumarização extrativa (TextRank em Deno).
4. Internal linking via `pg_trgm` / `tsvector` (sem IA).
5. External linking a partir de `authority_sources` + domínios extraídos.
6. UI "Fila de Curadoria" com ações Publicar/Reescrever/Rejeitar.

### Sprint 3 — SEO/AEO/GEO/EEAT estado-da-arte (1 semana, P1)
1. `sitemap-news.xml` (Google News 48h) + `/feed.xml`.
2. Schema `NewsArticle` + `Person` + `NewsMediaOrganization` + breadcrumbs por rota.
3. Páginas EEAT: `/equipe-editorial`, `/principios-editoriais`, `/metodologia`, `/politica-de-correcoes`, `/fontes`, `/autores/:slug`.
4. Corrigir `robots.txt` e `BASE_URL` (single source of truth via `site_settings`).
5. IndexNow ping + auto-submit de sitemap ao GSC após cada publicação.
6. `hreflang` e `lang` corretos; canonical único por rota.

### Sprint 4 — Performance / Indexabilidade (1 semana, P1)
1. Pré-render SSG das rotas públicas críticas (`/`, `/blog`, `/blog/:slug`, `/topico/:slug`, `/guia/:slug`) — avaliar `vite-plugin-ssg` ou pivot p/ Astro.
2. Pipeline de imagens (WebP/AVIF + `srcset` + LQIP).
3. HTTP cache + stale-while-revalidate; preconnect/preload nos críticos.
4. Auditoria Lighthouse com meta ≥ 95 em todas as categorias.

### Sprint 5 — Hardening + observabilidade (0,5 semana, P2)
1. Substituir todos os `.single()` problemáticos remanescentes por `.maybeSingle()` com tratamento.
2. Dashboard de saúde de fontes (taxa de fetch, latência, falhas, novelty).
3. Alertas (Resend) para fontes que falham 3x consecutivas.
4. Testes E2E (Playwright) nos fluxos editor/leitor.

---

## 5. Resumo executivo

| Categoria | Itens |
|---|---|
| ✅ 100% OK | Schema, RLS, Auth, Lazy routing, Web Vitals, Helmet schemas, Profile, Education |
| 🟠 Parcial | Coleta RSS (com IA a remover), Sitemap (sem news), Auto-publish (com IA), EEAT pages, GSC, Cron |
| 🔴 Faltam | Cron 5min, Parser robusto, Sumarização extrativa, NewsArticle schema, IndexNow, Autor pages, sitemap-news, feed.xml, telas Jobs & Curadoria sem IA |
| 🛠️ Corrigir | `.single()` em loop, `robots.txt` domínio, BASE_URL hard-coded, canonical duplicado, índice único em curated_news |
| ⚡ Melhorar | SSG/pré-render, imagens WebP, cache, i18n, acessibilidade dark mode |

**Esforço total estimado**: ~4 semanas (1 dev fullstack), com Sprints 0+1 (1 semana) entregando custo-zero-IA + cron de 5 min + pipeline mínimo já em produção.

---

Aguardando aprovação para executar a partir da **Sprint 0**. Se aprovar, iniciarei pela remoção total de IA + cron de 5 min — os dois itens que destravam custo e frescor editorial imediatamente.
