## Páginas E-E-A-T — `/equipe-editorial` e `/autores/:slug`

### Objetivo
Fortalecer sinais de **Experience, Expertise, Authoritativeness, Trustworthiness** (Google Helpful Content + Quality Rater Guidelines) com páginas dedicadas à equipe e a cada autor, com conteúdo estruturado, schema.org `Person`/`NewsMediaOrganization` e links internos sólidos para os artigos.

### Estado atual
- Tabela `authors` tem: `id, name, bio, avatar, role, is_ai`. **Sem slug**, sem credenciais, sem links sociais, sem expertise.
- `BlogPost.tsx` exibe autor inline mas sem link para página do autor.
- Não existe `/equipe-editorial` nem `/autores/:slug`.
- Sitemap já reserva entrada para `/autores/:slug` (mas tabela atualmente não tem slug).

### Entregáveis

**1. Migração — enriquecer `authors`**
Adicionar colunas (todas opcionais exceto `slug`):
```
slug              text unique not null   -- gerar a partir de name
title             text                   -- "Editor-chefe", "Analista sênior"
credentials       text                   -- "PhD Economia Ambiental — USP"
expertise         text[]                 -- ["Crédito de Carbono", "Tokenização", "ReFi"]
years_experience  integer
linkedin_url      text
twitter_url       text
email_public      text
website_url       text
location          text
seo_meta_title       text
seo_meta_description text
published_articles_count integer default 0   -- denormalizado, atualizado por trigger ou refresh manual
```
- Backfill `slug` para autores existentes (`lower(regexp_replace(name,'[^a-zA-Z0-9]+','-','g'))`).
- Ajustar políticas RLS (manter SELECT público; UPDATE só admin).

**2. Rotas (`src/App.tsx`)**
- `/equipe-editorial` → `EditorialTeam.tsx` (público).
- `/autores/:slug` → `AuthorProfile.tsx` (público).

**3. `src/pages/EditorialTeam.tsx`** — `/equipe-editorial`
- Hero: princípios editoriais (independência, sem IA na produção, fontes RSS auditáveis, processo de revisão humana).
- Seção "Padrões editoriais": bullets + link para Política de Privacidade, Termos, página "Sobre".
- Seção "Processo de curadoria": passos do pipeline determinístico (RSS → curadoria → revisão → publicação) com link para `/sobre`.
- Grid de cards com todos os autores (`is_ai=false`): foto, nome, cargo, expertise (chips), CTA "Ver perfil" → `/autores/:slug`.
- Seção "Correções e contato": como reportar erro factual → link `/contato`.
- JSON-LD: `NewsMediaOrganization` + `ItemList` dos autores.
- SEO: `<Helmet>` com title "Equipe Editorial — Amazonia Research", description, canonical `/equipe-editorial`, og:*.

**4. `src/pages/AuthorProfile.tsx`** — `/autores/:slug`
- Header: avatar grande, nome, cargo, credenciais, anos de experiência, localização.
- Bio completa.
- Chips de expertise (cada um linka para `/tag/:slug` correspondente quando existir).
- Links sociais (LinkedIn, Twitter, site pessoal, email) com `rel="me"` (sinal E-E-A-T).
- Estatísticas: total de artigos publicados, categorias mais cobertas.
- Seção "Artigos recentes" (top 12 do autor, ordenados por `published_at desc`) — cada card linka para `/blog/:slug`.
- Seção "Tópicos que cobre" — top 5 categorias/tags do autor com links.
- Breadcrumb: Home › Equipe Editorial › Nome do autor.
- JSON-LD: `Person` (name, jobTitle, description, image, url, sameAs[]) + `BreadcrumbList`.
- SEO: title `{name} — {role} | Amazonia Research`, description usa bio truncada, canonical `/autores/:slug`, og:*.
- 404 (`NotFound`) se slug inexistente.

**5. Linkagem interna nos artigos (`src/pages/BlogPost.tsx`)**
- Tornar o nome do autor (no header e no rodapé "Sobre o autor") um `<Link to="/autores/${author.slug}">`.
- Adicionar `rel="author"` no link do header.
- Atualizar o JSON-LD do artigo (já existe via `SEOHead`?) para `author: { @type: "Person", name, url: "https://amazonia.estrato.com.br/autores/${slug}" }`.

**6. Navegação e footer**
- Footer: adicionar link "Equipe Editorial" na coluna "Sobre".
- Navbar (desktop): adicionar item "Equipe" entre "Sobre" e "Contato".

**7. Sitemap (`scripts/generate-sitemap.ts`)**
- Já lista `/autores/:slug` — confirmar que agora puxa do `authors.slug` (não do `profiles`). Adicionar `/equipe-editorial`.

**8. Admin — edição opcional**
- Os campos novos aparecem automaticamente em qualquer formulário de autor existente? Hoje **não existe CRUD de autores no admin**. Sugiro um item futuro (não bloqueante): página `/admin/authors`. **Fora do escopo deste sprint** — manter edição via SQL/seed por ora.

### Arquivos
```
supabase/migrations/<ts>_authors_eeat.sql        (migração)
src/pages/EditorialTeam.tsx                       (novo)
src/pages/AuthorProfile.tsx                       (novo)
src/App.tsx                                       (rotas)
src/components/Navbar.tsx                         (link "Equipe")
src/components/Footer.tsx                         (link "Equipe Editorial")
src/pages/BlogPost.tsx                            (nome do autor vira link + rel="author")
scripts/generate-sitemap.ts                       (incluir /equipe-editorial; usar authors.slug)
```

### Critérios de aceite
- `/equipe-editorial` retorna 200 com lista de autores reais, cards linkando para perfis.
- `/autores/:slug` carrega bio, expertise, links sociais e top 12 artigos do autor; gera JSON-LD `Person` válido.
- Sem-slug retorna NotFound.
- Nome do autor no `BlogPost` agora linka para `/autores/:slug` com `rel="author"`.
- Sitemap inclui `/equipe-editorial` + todos `/autores/:slug` ativos.
- Lighthouse SEO ≥ 95 nas duas páginas.
- Validador Rich Results do Google reconhece `Person` e `NewsMediaOrganization`.

### Perguntas antes de implementar
1. Já existe lista oficial de autores (nomes reais, fotos, bios) para popular, ou devo apenas usar os autores que já estão na tabela `authors` e deixar campos novos em branco para o admin preencher depois?
2. Confirmar que **não** quer CRUD de autores no admin agora (fica como próximo sprint)?
3. Quer que eu inclua link "Equipe Editorial" no Navbar **e** Footer, ou só Footer?

Aprovar para implementar?
