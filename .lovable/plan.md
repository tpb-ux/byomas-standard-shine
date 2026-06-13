## Fila de Curadoria — Revisão, Aprovação e Publicação de Rascunhos

### Objetivo
Tela dedicada para o editor revisar rascunhos gerados pelo pipeline determinístico (RSS → `auto-publish-articles`), aprovar/rejeitar/publicar em lote, com filtros e histórico auditável das ações.

### Estado atual
- `auto-publish-articles` cria artigos em `articles` com `status='draft'` (ou `published` se `publish=true`), `is_curated=false`, `ai_generated=false`.
- Tela `Curator.tsx` só lida com `curated_news` (notícias RSS brutas).
- `Articles.tsx` lista todos os artigos sem foco em rascunhos automáticos.
- Não há histórico de ações editoriais.

### Entregáveis

**1. Nova tabela `editorial_actions` (auditoria)**
```
id uuid pk
article_id uuid fk → articles(id) on delete cascade
user_id uuid fk → auth.users(id)
action text  -- 'approved' | 'rejected' | 'published' | 'unpublished' | 'edited' | 'reverted_to_draft'
notes text
created_at timestamptz default now()
```
- RLS: SELECT/INSERT para `authenticated` com role `admin` ou `editor` (via `has_role`).
- GRANTs padrão + `service_role`.
- Índice em `(article_id, created_at desc)`.

**2. Nova rota `/admin/queue` → `src/pages/admin/CurationQueue.tsx`**
- Listagem em tabela com colunas: título, fonte (`source_name`), categoria, palavra-chave principal, SEO score (join `seo_metrics`), criado em, status, ações.
- **Filtros (topbar):**
  - Status: rascunhos automáticos | rascunhos editados | publicados últimas 24h | rejeitados
  - Categoria (select)
  - Fonte (select de `source_name` distintos)
  - Busca por título
  - Período (date range: hoje, 7d, 30d, custom)
  - Toggle "só com SEO score < 60" (precisa revisão)
- **Ações por linha:**
  - Pré-visualizar (Sheet lateral com excerpt + meta + featured_image + conteúdo HTML rolável)
  - Editar (link → `/admin/articles/:id`)
  - Aprovar (mantém draft mas marca `is_curated=true` — sinaliza "revisado humano")
  - Publicar (`status='published'`, `published_at=now()`, dispara `process-article-tags` + `auto-internal-linking` via supabase.functions.invoke)
  - Rejeitar (`status='archived'` — adicionar valor ao enum se necessário; ou hard delete com confirmação)
  - Reverter para rascunho (em publicados)
- **Ações em lote:** checkbox por linha + barra inferior com "Aprovar selecionados" / "Publicar selecionados" / "Rejeitar selecionados".
- Toda ação grava linha em `editorial_actions` com `action`, `notes` opcional e `user_id = auth.uid()`.

**3. Aba "Histórico" dentro da mesma página**
- Tabela com últimas 200 ações: data, usuário (join `profiles.full_name`), ação, artigo (link), notas.
- Filtro por usuário, ação, período.

**4. Sidebar (`AppSidebar.tsx`)**
- Novo item "Fila de Curadoria" com ícone `Inbox`, posicionado logo abaixo de "Curadoria RSS" (`/admin/curator`).
- Badge com contagem de rascunhos pendentes (query `count(*) where status='draft' and is_curated=false`).

**5. Rotas (`App.tsx`)**
- Adicionar `/admin/queue` protegido por `ProtectedRoute` com roles `admin`/`editor`.

### Arquivos
```
supabase/migrations/<ts>_editorial_actions.sql   (novo — tabela + RLS + GRANTs)
src/pages/admin/CurationQueue.tsx                (novo — página principal)
src/components/admin/queue/QueueFilters.tsx      (novo)
src/components/admin/queue/QueueRow.tsx          (novo)
src/components/admin/queue/ArticlePreviewSheet.tsx (novo)
src/components/admin/queue/BulkActionsBar.tsx    (novo)
src/components/admin/queue/ActionHistoryTab.tsx  (novo)
src/hooks/useCurationQueue.ts                    (novo — React Query: lista, mutate aprovar/publicar/rejeitar)
src/hooks/useEditorialActions.ts                 (novo — log + leitura de histórico)
src/components/layout/AppSidebar.tsx             (editar — adicionar item)
src/App.tsx                                      (editar — rota)
```

### Critérios de aceite
- Editor abre `/admin/queue` e vê todos os rascunhos automáticos pendentes.
- Filtros funcionam combinados; URL reflete filtros (`?status=draft&source=...`) para deep-link.
- Aprovar 1 rascunho marca `is_curated=true` e cria linha em `editorial_actions`.
- Publicar dispara `status='published'` + `process-article-tags` + `auto-internal-linking` e grava histórico.
- Ações em lote operam transacionalmente (uma falha não derruba o lote — relatório de sucesso/erro).
- Aba Histórico mostra a ação executada com timestamp e usuário correto.
- Sidebar mostra badge com contagem pendente, atualizada via React Query polling 60s.
- Sem uso de IA em nenhum ponto.

### Perguntas antes de implementar
1. Rejeitar deve fazer **hard delete** do artigo ou marcar como `archived` (preservando para auditoria)? Recomendo `archived`.
2. Permitir notas obrigatórias ao rejeitar? Recomendo opcional, mas com placeholder sugerindo justificativa.
3. Confirmar que **apenas `admin` e `editor`** acessam essa fila (não `authenticated` genérico)?

Aprovar para implementar?
