# Fold

**Notes, without the noise.**

Fold is a quiet, local-first notes workspace and installable Progressive Web App (PWA) for the web. Everything you write lives exclusively on your device in IndexedDB — zero tracking, zero cookies, zero accounts, and zero cloud lock-in.

## Highlights

- **Local-First Persistence:** Notes commit on-device via IndexedDB (`fold_db` v2) with a `localStorage` recovery mirror (`fold.notes.v1`) and durable storage pinning (`navigator.storage.persist()`).
- **Multi-Tab Sync:** Real-time `BroadcastChannel` (`fold_sync_v2`) synchronization across open browser tabs without any server.
- **Rich Text & Markdown Portability:** Built on TipTap v3 with headings, checklists, code blocks, highlights, and bidirectional CommonMark/GFM import & export (single `.md`, full `.json` backup, or folder-structured `.zip` vault).
- **Offline PWA:** Service Worker (`/sw.js`) uses network-first navigation with offline cache fallback and self-hosted fonts (`Instrument Sans` and `JetBrains Mono`) via `next/font`.
- **Two Stationery Themes:** Warm Paper (`#f4f0e6`) and Obsidian Ink (`#141511`), plus optional synthesized Web Audio tactile feedback.

## Getting Started

Fold uses `pnpm` as its package manager (`pnpm-lock.yaml`).

```bash
# 1. Install dependencies
pnpm install

# 2. Optional: configure site URL / contact email
cp .env.example .env.local

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page and live preview, or [http://localhost:3000/app](http://localhost:3000/app) for the full workspace.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Create optimized production build |
| `pnpm start` | Serve production build locally |
| `pnpm lint` | Run ESLint across the project |
| `pnpm typecheck` | Run TypeScript compiler check (`tsc --noEmit`) |

## Project Structure

```text
src/
├── app/
│   ├── app/             # Standalone distraction-free /app workspace route
│   ├── blog/            # Field Notes blog & MDX article routes
│   ├── privacy/         # Privacy policy
│   ├── terms/           # Terms of use
│   ├── page.tsx         # Landing page & interactive showcase
│   ├── robots.ts        # Dynamic robots.txt
│   └── sitemap.ts       # Dynamic sitemap.xml
├── components/
│   ├── FoldWorkspace.tsx # Interactive landing-page workspace preview
│   ├── landing/          # Landing page sections & footer
│   └── workspace/        # Full TipTap editor, sidebar, note list & modals
├── content/blog/         # MDX essays
└── lib/
    ├── storage/          # IndexedDB engine, Markdown/ZIP export, BroadcastChannel sync
    ├── audio-haptics.ts  # Synthesized Web Audio micro-haptics
    ├── site.ts           # Site metadata, URL & theme tokens
    └── use-theme.ts      # Paper / Ink theme hook
```

## Keyboard Shortcuts

Replace `⌘` with `Ctrl` (`⌥` with `Alt`) on Windows and Linux.

| Shortcut | Scope | Action |
| --- | --- | --- |
| `⌘K` | Global / Editor | Command palette (or insert/edit link when text is selected) |
| `N` / `⌥⇧N` | Global | Create a new note (`N` outside text inputs) |
| `⌘S` | Global | Save immediately to IndexedDB |
| `⌘.` | Global | Toggle full-screen Zen mode (`Esc` exits) |
| `⌘P` | Global | Pin or unpin selected note |
| `⌘D` | Global | Duplicate selected note |
| `⌘\` | Global | Toggle sidebar |
| `⌥⇧L` | Global | Lock or unlock selected note |
| `T` | Global | Toggle Paper / Ink theme (outside text inputs) |
| `⌘/` | Editor | Show or hide the floating formatting dock |
| `⌘B` / `⌘I` | Editor | Bold / Italic |
| `⌘⌥1` / `⌘⌥2` / `⌘⌥3` | Editor | Toggle Heading (`H1` / `H2` / `H3`) |
| `⌘⇧8` / `⌘⇧7` / `⌘⇧9` | Editor | Bullet list / Numbered list / Checklist |
| `⌘⇧Y` | Editor | Highlight text |
| `⌘Z` / `⌘⇧Z` | Editor | Undo / Redo |

## Environment Variables

See [`.env.example`](./.env.example):

- `NEXT_PUBLIC_SITE_URL` — Canonical URL for metadata, Open Graph images, and `sitemap.xml` (defaults to `https://foldnotes.app`).
- `NEXT_PUBLIC_SUPPORT_EMAIL` — Contact address shown in footer, FAQ, and legal pages.
- `NEXT_PUBLIC_GITHUB_URL` — Public GitHub repository URL linked from the landing page (defaults to `https://github.com/dhairya0707/fold`).

## Contributing & Security

- Contributions are welcome — please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request.
- For security disclosures or local-storage boundary concerns, see [`SECURITY.md`](./SECURITY.md).

## License

Released under the [MIT License](./LICENSE).
