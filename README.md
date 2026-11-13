<div align="center">

<img src="./public/icon-192.png" alt="Fold Logo" width="76" height="76" />

<h1>Fold</h1>

<p><strong>Notes, without the noise.</strong></p>

<p>
  A quiet, local-first notes workspace and installable Progressive Web App (PWA) for the web.<br />
  Everything stays on your device in IndexedDB, with zero tracking, cookies, or accounts.
</p>

<p>
  <a href="https://foldnotes.web.app"><img src="https://img.shields.io/badge/Live-foldnotes.web.app-b8452c?style=flat-square" alt="Live Site" /></a>
  <a href="https://foldnotes.web.app/app"><img src="https://img.shields.io/badge/PWA-Open%20Workspace-191712?style=flat-square" alt="Open Workspace" /></a>
  <img src="https://img.shields.io/badge/Next.js-16.4.5-191712?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16.4.5" />
  <img src="https://img.shields.io/badge/React-19.3-20232a?style=flat-square&logo=react&logoColor=61dafb" alt="React 19.3" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/TipTap-v3.33-0f172a?style=flat-square" alt="TipTap v3" />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-5f594c?style=flat-square" alt="MIT License" /></a>
</p>

<p>
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quickstart">Quickstart</a> •
  <a href="#routes-and-structure">Routes</a> •
  <a href="#keyboard-shortcuts">Shortcuts</a> •
  <a href="#security-and-privacy">Security</a> •
  <a href="#production-verification">Verification</a>
</p>

</div>

---

## Features

| Capability | What it does |
| --- | --- |
| **Local-first engine** | Sub-millisecond commits to IndexedDB (`fold_db` v2) with automatic `localStorage` recovery (`fold.notes.v1`) and durable storage pinning (`navigator.storage.persist()`). |
| **Real-time tab sync** | Cross-tab `BroadcastChannel` (`fold_sync_v2`) keeps notes, folders, and edits synchronized across open windows with zero network requests. |
| **TipTap v3 rich editor** | Headings, interactive checklists, code blocks, highlights, note locking, pinning, and distraction-free Zen mode (<kbd>⌘</kbd><kbd>.</kbd>). |
| **Portable vault exports** | Bidirectional CommonMark and GFM import and export: single `.md` files, full `.json` workspace backups, or folder-organized `.zip` archives (lazy-loaded `JSZip`). |
| **Offline-ready PWA** | Service Worker (`/sw.js`) with network-first document navigation, static asset caching, and self-hosted fonts (`Instrument Sans` and `JetBrains Mono`). |
| **Paper and Ink themes** | Warm **Paper** (`#f4f0e6`) and dark **Ink** (`#141511`) stationery themes with View Transitions, WCAG AA contrast, reduced-motion support, and optional Web Audio feedback. |

---

## Architecture

```mermaid
flowchart LR
  Editor["TipTap v3 Workspace (/app)"] --> IDB[("IndexedDB\nfold_db v2")]
  Editor --> Mirror[("localStorage Mirror\nfold.notes.v1 & fold.folders.v1")]
  Editor <--> Sync["BroadcastChannel\nfold_sync_v2"]
  Editor --> Export["Markdown / JSON / ZIP Vault\n(DOMParser + Lazy JSZip)"]
  SW["Service Worker (/sw.js)"] --> Cache[("Offline Static Cache\nfold-v2.1")]
```

### Tech stack

| Layer | Technology | Implementation details |
| --- | --- | --- |
| **Framework** | Next.js `16.4.5` (App Router, Turbopack) | `output: "export"` pure static build (`out/`) for Firebase Hosting |
| **UI and language** | React `19.3`, TypeScript `5`, Tailwind CSS `4` | Strict `tsc --noEmit` and ESLint |
| **Editor** | TipTap `3.33` | StarterKit, TaskList, TaskItem, Highlight, Placeholder |
| **Storage and sync** | IndexedDB, `localStorage`, `BroadcastChannel` | Indexed `notes` store (`updated`, `folder`) and multi-tab IPC |
| **Typography** | `next/font/google` (self-hosted) | `Instrument Sans` and `JetBrains Mono` (zero external font CDNs) |
| **Testing** | Node.js built-in test runner | `node --test "src/**/*.test.ts"` (zero extra test dependencies) |

---

## Quickstart

> **Prerequisites:** Node.js `>= 20` (tested on Node `24`) and `pnpm`.

```bash
# 1. Install dependencies
pnpm install

# 2. Configure public environment variables
cp .env.example .env.local

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page and interactive preview, or [http://localhost:3000/app](http://localhost:3000/app) for the full workspace.

### Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Create optimized production build |
| `pnpm start` | Serve production build locally |
| `pnpm lint` | Run ESLint across the repository |
| `pnpm typecheck` | Run TypeScript compiler check (`tsc --noEmit`) |
| `pnpm test` | Run unit tests (`node --test "src/**/*.test.ts"`) |

---

## Routes and structure

### Application routes

| Route | Mode | Purpose |
| --- | --- | --- |
| `/` | Static | Landing page, interactive 3-pane demo, architecture specs, and FAQ |
| `/app` | Static (Client Shell) | Full distraction-free workspace and PWA `start_url` (`noindex`) |
| `/blog` | Static | Field Notes essays index |
| `/blog/[slug]` | SSG / Partial Prerender | MDX articles with TOC, code blocks, and dynamic OG images (including `/blog/install-fold-as-offline-pwa`) |
| `/privacy`, `/terms` | Static | Client storage inventory and MIT usage terms |
| `/api/health` | Dynamic (`GET`) | Liveness probe returning `{ status, timestamp }` (`Cache-Control: no-store`) |
| `/robots.txt`, `/sitemap.xml` | Static | Search crawler rules and canonical URL index |

<details>
<summary><strong>Project structure</strong> (click to expand)</summary>

```text
public/
├── llms.txt              # Concise LLM product & architecture reference
├── llms-full.txt         # Extended technical specification
├── manifest.webmanifest  # PWA install manifest (/app start URL)
└── sw.js                 # Offline Service Worker & asset cache
src/
├── app/
│   ├── api/health/       # Liveness health check endpoint (/api/health)
│   ├── app/              # /app workspace route, loading skeleton & error boundary
│   ├── blog/             # Field Notes blog & MDX article routes
│   ├── privacy/          # Privacy policy & storage key inventory
│   ├── terms/            # Terms of use
│   ├── error.tsx         # Route-segment error boundary
│   ├── global-error.tsx  # Root layout error boundary
│   ├── page.tsx          # Landing page & interactive showcase
│   ├── robots.ts         # Dynamic robots.txt
│   └── sitemap.ts        # Dynamic sitemap.xml
├── components/
│   ├── FoldWorkspace.tsx # Interactive landing-page workspace preview
│   ├── IslandNavbar.tsx  # Floating top navigation bar
│   ├── blog/             # Blog listing, Markdown renderer, TOC & code blocks
│   ├── landing/          # Landing page sections & footer
│   ├── wensity/          # Shared UI primitives (kbd, label, select, buttons)
│   └── workspace/        # Full TipTap editor, sidebar, note list & modals
├── content/blog/         # MDX essays
├── lib/
│   ├── storage/          # IndexedDB engine, Markdown/ZIP export, sync & unit tests
│   ├── audio-haptics.ts  # Synthesized Web Audio micro-haptics
│   ├── blog.ts           # Server-only MDX/MD blog loader
│   ├── blog-shared.ts    # Client-safe blog types & heading helpers
│   ├── site.ts           # Site metadata, URL validation & theme tokens
│   └── use-theme.ts      # Paper / Ink theme hook
└── types/
    └── note.ts           # Note schema, sort modes & default folders
```

</details>

---

## Keyboard shortcuts

> Replace <kbd>⌘</kbd> with <kbd>Ctrl</kbd> and <kbd>⌥</kbd> with <kbd>Alt</kbd> on Windows and Linux.

| Shortcut | Scope | Action |
| --- | --- | --- |
| <kbd>⌘</kbd><kbd>K</kbd> | Global / Editor | Open Command Palette (or insert/edit link when text is selected or caret is in a link) |
| <kbd>/</kbd> | Global | Focus workspace search bar (outside text inputs/dialogs; <kbd>Esc</kbd> clears & blurs) |
| <kbd>N</kbd> / <kbd>⌥</kbd><kbd>⇧</kbd><kbd>N</kbd> | Global | Create a new note (<kbd>N</kbd> outside text inputs) |
| <kbd>⌘</kbd><kbd>S</kbd> | Global | Save immediately to IndexedDB |
| <kbd>⌘</kbd><kbd>.</kbd> | Global | Toggle full-screen Zen mode (<kbd>Esc</kbd> exits) |
| <kbd>⌘</kbd><kbd>P</kbd> | Global | Pin or unpin selected note |
| <kbd>⌘</kbd><kbd>D</kbd> | Global | Duplicate selected note |
| <kbd>⌘</kbd><kbd>\\</kbd> | Global | Toggle sidebar |
| <kbd>⌥</kbd><kbd>⇧</kbd><kbd>L</kbd> | Global | Lock or unlock selected note |
| <kbd>T</kbd> | Global | Toggle Paper / Ink theme (outside text inputs) |
| <kbd>⌘</kbd><kbd>/</kbd> | Global / Editor | Show or hide the floating formatting dock (when a note is active) |

<details>
<summary><strong>Rich-text editor shortcuts</strong> (click to expand)</summary>

| Shortcut | Scope | Action |
| --- | --- | --- |
| <kbd>⌘</kbd><kbd>B</kbd> / <kbd>⌘</kbd><kbd>I</kbd> | Editor | Bold / Italic |
| <kbd>⌘</kbd><kbd>⌥</kbd><kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> | Editor | Toggle Heading (`H1` / `H2` / `H3`) |
| <kbd>⌘</kbd><kbd>⇧</kbd><kbd>8</kbd> | Editor | Bullet list |
| <kbd>⌘</kbd><kbd>⇧</kbd><kbd>7</kbd> | Editor | Numbered list |
| <kbd>⌘</kbd><kbd>⇧</kbd><kbd>9</kbd> | Editor | Interactive task checklist |
| <kbd>⌘</kbd><kbd>⇧</kbd><kbd>Y</kbd> | Editor | Highlight text |
| <kbd>⌘</kbd><kbd>Z</kbd> / <kbd>⌘</kbd><kbd>⇧</kbd><kbd>Z</kbd> | Editor | Undo / Redo |

</details>

---

## Environment variables

All runtime variables are public (`NEXT_PUBLIC_*`) and optional. Fallback defaults are defined in [`src/lib/site.ts`](./src/lib/site.ts). See [`.env.example`](./.env.example):

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://foldnotes.web.app` | Canonical origin for metadata, Open Graph URLs, and `sitemap.xml` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support.dhairyadarji@gmail.com` | Public contact address shown in footer, FAQ, and legal pages |
| `NEXT_PUBLIC_GITHUB_URL` | `https://github.com/dhairya0707/fold` | Public GitHub repository URL linked from the landing page |

---

## Security and privacy

Notes never leave the browser, and Fold uses no cookies, telemetry SDKs, or external font or CDN requests.

In [`next.config.ts`](./next.config.ts), HTTP responses enforce `Content-Security-Policy` (`connect-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy`.

HTML and Markdown imports parse inside inert `DOMParser` documents with 10 MB import size caps, explicit schema validation, YAML frontmatter escaping, and strict `http:`, `https:`, `mailto:`, or single-slash relative URL checks.

For full security boundaries or reporting issues, see [`SECURITY.md`](./SECURITY.md).

---

## Production verification

Run the full verification suite before deploying:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

After starting the production server (`pnpm start`):

- `GET /api/health` returns `200 OK` with `Cache-Control: no-store`.
- `GET /sw.js` returns `Cache-Control: no-cache, no-store, must-revalidate` so deployments update cleanly.

---

## Contributing, changelog, and license

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request. Track release notes in [`CHANGELOG.md`](./CHANGELOG.md). Fold is released under the [MIT License](./LICENSE).

<div align="center">
  <br />
  <sub>Built by <a href="https://x.com/dhairya0707">Dhairya Darji</a> · Local-first, private by architecture.</sub>
</div>
