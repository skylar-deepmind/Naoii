<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project: Naoii — 多语言表达训练社区

### Quick commands

```bash
docker compose up -d                  # start PostgreSQL (required before dev)
npm run dev                           # start dev server (Turbopack)
npm run build                         # prisma generate → next build
npm run typecheck                     # tsc --noEmit
npm run lint                          # eslint (flat config)
npx prisma migrate dev                # create & apply migration
npx prisma migrate dev --create-only  # create without applying (add data SQL manually)
```

### Route groups (critical)

```
app/(main)/     → authenticated pages with Sidebar layout (sidebar + MobileBottomNav)
app/(public)/   → public pages with Navbar + Footer (no sidebar)
```

Pages in `(main)/` automatically get the sidebar + mobile bottom nav. **Never** add a standalone `layout.tsx` inside `(main)/` subdirectories — use the shared `(main)/layout.tsx`.

### Dual content model

- **`Entry`** — primary content model (use for all new code). `type`: `MOMENT` | `ARTICLE`.
- **`Post`** — legacy, kept **only** for `Correction.postId` FK. When creating an Entry, a mirror `Post` is created with the **same ID** so corrections continue to work.
- **`Correction`** — references `Post.id`. To get corrections for an Entry, query `Correction` WHERE `postId = entry.id` (shared IDs).
- **`Comment`** — belongs to `Entry` (via `entryId`). Also has optional `correctionId` for correction-level discussions.

### Auth

- JWT stored in `naoii_session` httpOnly cookie (7 days). Library: `jose`.
- Middleware protects `/app`, `/feed`, `/library`, `/notifications`, `/settings`, `/posts/new`, `/articles/new`, `/admin`.
- Server actions get current user via `getCurrentUser()` from `lib/auth.ts`.
- Passwords hashed with `bcryptjs` (12 rounds).

### i18n

- Locale stored in `naoii_lang` cookie: `zh` (default), `en`, `ja`.
- Use `getDict()` in server components, `useDict()` pattern not available — pass dict as prop to client components.
- Keys in `locales/{zh,en,ja}.ts`. Type `Dictionary` from `locales/index.ts`.
- New UI text must be added to **all three** locale files with a Chinese fallback.

### Server vs Client boundary

- **`lib/prisma.ts`** imports `@prisma/adapter-pg` which requires Node builtins (`fs`, `net`, `tls`). **Never** import Prisma in a `"use client"` component — build will fail with module-not-found errors.
- **`server/queries/`** — regular modules (no `"use server"`), imported only by server components.
- **`server/actions/`** — `"use server"` modules, callable from client components via FormData.
- Data flow for client components that need DB data: server component fetches → passes as props → client component renders.
- **`CommentSection`** is a client component that receives `initialComments` prop — do NOT import query functions directly in it.
- **`CorrectionComments`** fetches via `fetch("/api/comments")` to avoid Prisma in client bundle.

### Prisma specifics

- **Prisma 7.x** with `prisma.config.ts` (datasource URL from env, not schema.prisma).
- Uses `@prisma/adapter-pg` (direct PostgreSQL, not connection pool).
- Migrations in `prisma/migrations/`. Add data-copy SQL inside migration files before applying.
- `npx prisma generate` is already in the `build` script; run manually after schema changes.

### Styles

- **Tailwind v4** with `@tailwindcss/postcss` plugin.
- **daisyUI v5** with custom themes `naoii` / `naoii-dark`.
- Component library in `components/ui/` (Button, Card, Badge, Input, Select, Textarea, etc.).
- `cn()` helper from `lib/utils.ts` for class merging.

### Image upload

- `app/api/upload/route.ts` accepts multipart form data, validates (≤5MB, JPG/PNG/WebP/GIF), saves to `public/uploads/`.
- Returns `{ url: "/uploads/filename.jpg" }`.
- In production Docker, mount a volume at `public/uploads/` or uploaded files are lost on redeploy.
- `ImageCropper` component handles client-side cropping before upload (1200×500 canvas).

### Key components

- `Sidebar` — desktop-only vertical nav, 220px, accepts sections with items (key, label, href, icon, badge, disabled).
- `MobileBottomNav` — 5 tabs (home, moments, create, notifications, me), `lg:hidden`.
- `ArticleEditor` — shared by create + edit article pages. Accepts `editEntry?` for pre-filling.
- `CommentSection` / `CommentItem` / `CommentForm` — composable comment tree with sorting, likes, nested replies, optional `correctionId`.
- `SlideDrawer` — right-side sliding panel (420px), used for correction comments.
- `PostWizard` — 3-step moment creation form (direction → content → confirm).

### Common gotchas

- **Prisma in client component** → build crash (pg adapter). Use API routes or server-component prop passing.
- **`"use server"` in `server/queries/`** → these are regular server-only modules, NOT server actions. Don't add the directive.
- **`dict.article?.xxx`** — all article-related dict keys must exist in zh, en, ja files. Missing keys fall back to the hardcoded Chinese string.
- **`Entry.type`** is `"MOMENT"` (not `"moment"`) and `"ARTICLE"` (not `"article"`).
- **`env:`** requires `DATABASE_URL` and `JWT_SECRET` at minimum.
- **`marked`** library was removed — no Markdown support in articles.
- When creating new locale keys, add `feed.hottest: "最热"` pattern to all 3 files and use `dict.feed?.hottest || "最热"`.

## Development Rules

- 修改前先分析相关定义、引用、调用链和测试。
- 优先使用 Serena 和 LSP 获取代码关系。
- 优先复用现有组件、类型、工具函数和项目模式。
- 只做当前需求需要的最小修改，不进行无关重构。
- 审查任务先报告问题，未经明确要求不要修改。
- 公共接口变化前检查所有调用方。
- 修改后运行相关 lint、类型检查和测试。
- 不确定时读取源码，不根据文件名或旧上下文猜测。