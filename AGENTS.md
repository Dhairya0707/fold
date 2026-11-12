# AGENTS.md — Project Operating Manual & Specialist Roles

## 1. Commands (Run & Verify Before Finishing Any Task)

- Install: `pnpm install`
- Dev: `pnpm dev`
- Typecheck & Lint: `pnpm lint && pnpm typecheck`
- Test: `pnpm test` (`node --test src/**/*.test.ts`)
- Build: `pnpm build` (production serve: `pnpm start`)

## 2. Core Guardrails

- Read relevant files before editing; never guess file paths or APIs.
- Keep diffs minimal, typed, and aligned with existing project patterns.
- Never commit secrets, `.env` files, or raw debug logs.
- Never add new dependencies without explicit approval.

## 3. Directory Map

```text
src/
├── app/                   # Next.js App Router pages, layouts, metadata, /app, /blog, /api/health
├── components/
│   ├── blog/              # Blog listing, Markdown renderer, code block, TOC, article actions
│   ├── landing/           # Landing sections, bento grid, FAQ accordion, CTA, footer
│   ├── workspace/         # TipTap editor, sidebar, note list, command palette, storage modal
│   └── wensity/           # Reusable UI primitives (kbd, label, native-select, buttons)
├── content/blog/          # MDX/MD Field Notes essays
├── lib/
│   ├── storage/           # IndexedDB engine (idb.ts), Markdown/ZIP (markdown.ts), BroadcastChannel (sync.ts)
│   ├── blog.ts            # Server-only fs blog loader (do not import in client components)
│   ├── blog-shared.ts     # Client-safe blog types, date formatting, and heading slug helpers
│   ├── site.ts            # Canonical URL, author, engine constants, theme hex tokens
│   └── use-theme.ts       # Paper/Ink theme hook with View Transitions
└── types/note.ts          # Note, SortMode, SaveStatus, StorageStats, DEFAULT_FOLDERS
public/                    # PWA manifest, Service Worker (sw.js), icons, llms.txt, llms-full.txt
docs/                      # Gitignored specialist persona docs (/docs/ in .gitignore)
```

## 4. Architectural Boundaries & Conventions

- **Path Alias:** `@/*` maps to `./src/*` (`tsconfig.json`).
- **Server vs. Client Blog Split:** `src/lib/blog.ts` uses `node:fs` and `node:path` and must only be imported by Server Components/routes; Client Components must import types and helpers from `src/lib/blog-shared.ts`.
- **Local-First Storage Isolation:** Notes and workspace state stay strictly client-side in IndexedDB (`fold_db` v2), `localStorage` (`fold.notes.v1`, `fold.folders.v1`, `fold.theme.v1`, `fold.sound.v1`, `fold.lastBackupDate`), and `BroadcastChannel` (`fold_sync_v2`). Never add remote persistence, cookies, or telemetry SDKs.
- **Paper / Ink Theming & Fonts:** Themes (`data-theme="paper" | "ink"`) are driven by CSS variables in `src/app/globals.css`, initialized pre-paint in `src/app/layout.tsx`, and toggled via `src/lib/use-theme.ts`. Only `Instrument Sans` and `JetBrains Mono` are loaded via `next/font/google`.
- **Static Export & Rendering Mode:** `next.config.ts` sets `output: "export"` and `images: { unoptimized: true }` to emit a 100% static bundle in `out/` for Firebase Hosting (`firebase.json` configures `cleanUrls: true` and HTTP security/cache headers). All dynamic routes use `generateStaticParams` / `dynamic = "force-static"` / `dynamicParams = false`.
- **Browser-Reserved Shortcuts:** Workspace shortcuts intentionally avoid browser-reserved combos (`⌥⇧N` instead of `⌘N`, `⌘.` instead of `⌘⇧F`, `⌥⇧L` instead of `⌘⇧L`, `⌘/` instead of `⌘⇧T`). `NoteEditor` intercepts `⌘K` in capture phase only when text is selected or the caret is inside a link; otherwise `WorkspaceContext` toggles the Command Palette. `/` focuses the note search bar outside text inputs/dialogs.

## 5. Definition of Done

1. Run `pnpm lint && pnpm typecheck`, `pnpm test`, and `pnpm build` after final edits with zero errors.
2. Verify no cookies, third-party runtime CDNs, analytics, or secrets were introduced.
3. Update `README.md`, `SECURITY.md`, `CHANGELOG.md`, `public/llms*.txt`, or `src/app/privacy/page.tsx` if routes, shortcuts, security headers, or storage keys changed.

## 6. Specialist Role Routing

When asked to perform a specialized review or task, load and strictly follow the corresponding persona file (in gitignored `docs/`):

- **Security Audit** (`@security`): Follow `docs/security-auditor.md`
- **UI/UX & Micro-Interactions** (`@ui-ux`): Follow `docs/ui-ux-director.md`
- **Production Readiness** (`@prod-check`): Follow `docs/prod-readiness.md`
- **Documentation Sync** (`@docs`): Follow `docs/docs-manager.md`
