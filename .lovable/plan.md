## Adicionar `sitemap-news.xml` e `/feed.xml`

### Estado atual
- Existe `generate-sitemap` (edge function) com `BASE_URL` hard-coded incorreto (`byomaresearch.com`).
- Não existe sitemap específico para Google News nem feed RSS público.
- `robots.txt` referencia apenas `https://amazonia.news/sitemap.xml`.
- Domínio canônico atual: `https://amazonia.estrato.com.br` (memória de SEO).

### Entregáveis

**1. Edge function `generate-news-sitemap`** → servida em `/sitemap-news.xml`
- Spec Google News: artigos publicados nas **últimas 48h**, máx 1.000 entradas.
- Namespace `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"`.
- Por artigo: `<loc>`, `<news:publication>` (name + language `pt`), `<news:publication_date>`, `<news:title>`, `<news:keywords>` (do `main_keyword` + `long_tail_keywords`), `<news:genres>` se aplicável.
- Headers: `Content-Type: application/xml; charset=utf-8`, `Cache-Control: public, max-age=300`.

**2. Edge function `generate-rss-feed`** → servida em `/feed.xml`
- RSS 2.0 + namespaces `atom`, `content`, `media`.
- Últimos 50 artigos publicados (sem paginação — RSS readers consomem o feed inteiro; paginação RSS é uso de nicho).
- Por item: `<title>`, `<link>` canônico, `<guid isPermaLink="true">`, `<pubDate>` (RFC 822), `<description>` (excerpt), `<content:encoded>` (HTML do artigo), `<category>` (categoria + tags), `<media:content>` (featured_image), `<author>` (fallback "Redação Amazonia Research").
- `<atom:link rel="self">` apontando para `/feed.xml` e `<lastBuildDate>`.

**3. Atualizar `generate-sitemap` existente**
- Trocar `BASE_URL` para `https://amazonia.estrato.com.br`.
- Adicionar entradas para `/topico/:slug`, `/tag/:slug`, `/glossario/:slug`, `/guia/:slug`, `/autores/:slug` (se existir tabela), além das estáticas que já lista.
- Adicionar **sitemap index** (`/sitemap-index.xml`) referenciando `sitemap.xml` + `sitemap-news.xml` — boa prática quando há múltiplos sitemaps.

**4. Roteamento via Vite middleware / redirect**
URLs públicas precisam ser amigáveis (`/sitemap-news.xml`, `/feed.xml`, `/sitemap.xml`, `/sitemap-index.xml`). Como o app é SPA estática Vite, a forma mais simples e robusta é criar **stubs em `public/`** que façam `<meta http-equiv="refresh">` para a edge function. Porém crawlers preferem 200/XML direto.

**Recomendação:** criar arquivos JS pequenos no `public/` não resolve. Em vez disso, propor uma das duas opções abaixo — escolher 1.

| Opção | Como funciona | Prós | Contras |
|---|---|---|---|
| **A. Plugin Vite + `vite-plugin-html`/middleware** que durante `vite dev` e `vite build` chama a edge function e grava `public/sitemap-news.xml` / `public/feed.xml` antes do build | Servido como arquivo estático, 200 OK, sem latência | Conteúdo "congela" no build; precisa rebuild + republish para atualizar | Sem custo extra de execução |
| **B. Servir via edge function + redirect/rewrite no host** (Lovable hosting tem SPA fallback, mas suporta `_redirects` style? — não suporta atualmente) | Sempre fresco | Implementação simples na edge | Lovable hosting não roteia `/sitemap-news.xml` para edge function diretamente |

→ **Vou propor a Opção A** (gerador estático em build) **combinada com cron horário que reescreve via deploy ou um endpoint público da edge function**. Mais realista para o setup atual: criar scripts `scripts/generate-news-sitemap.ts` e `scripts/generate-feed.ts` que rodam em `predev`/`prebuild` (consultam o banco com a anon key) e gravam em `public/`. Para frescor entre builds, o cron horário existente faz `POST` à edge function que regrava os arquivos via Supabase Storage público — mas isso muda a URL para `storage/v1/object/public/...`, o que não atende à UX desejada.

→ **Solução pragmática final**: scripts `predev`/`prebuild` que geram os arquivos em `public/` no momento do build. Para frescor diário, o pipeline de publish do usuário cuida (1 clique em "Publicar" regrava). Para o Google News (janela 48h), apontar via `robots.txt` mesmo assim — o crawler revisita.

**5. Atualizar `public/robots.txt`**
- Trocar `Sitemap:` para `https://amazonia.estrato.com.br/sitemap-index.xml`.
- Adicionar `Sitemap: https://amazonia.estrato.com.br/sitemap-news.xml`.

**6. Adicionar link `<link rel="alternate" type="application/rss+xml">`** em `index.html` apontando para `/feed.xml`.

### Arquivos novos/alterados
```
scripts/generate-sitemap.ts          (novo — substitui edge function como fonte de verdade)
scripts/generate-news-sitemap.ts     (novo)
scripts/generate-feed.ts             (novo)
public/sitemap.xml                   (regenerado)
public/sitemap-news.xml              (novo, gerado)
public/sitemap-index.xml             (novo, gerado)
public/feed.xml                      (novo, gerado)
public/robots.txt                    (atualizado)
index.html                           (adicionar <link rel="alternate">)
package.json                         (predev/prebuild hooks)
```

A edge function `generate-sitemap` é mantida só como API auxiliar (admin pode invocar para preview), mas a verdade fica nos arquivos estáticos.

### Critérios de aceite
- `curl https://amazonia.estrato.com.br/sitemap-news.xml` → 200, XML válido, só artigos < 48h.
- `curl https://amazonia.estrato.com.br/feed.xml` → 200, RSS 2.0 válido (passa em https://validator.w3.org/feed/).
- `sitemap-index.xml` lista os 2 sitemaps.
- `robots.txt` aponta para o index correto.
- Google Search Console "Inspect URL" reconhece o sitemap-news ao submeter.

### Pergunta para você antes de implementar
Confirmo o domínio canônico **`https://amazonia.estrato.com.br`**? Se preferir `https://amazonia.news` ou `https://estratoamazonia.lovable.app`, ajusto.

Aprovar para implementar?
