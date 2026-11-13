# Changelog

All notable changes to Fold are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Health check endpoint at `/api/health` (`src/app/api/health/route.ts`).
- Dedicated root (`src/app/global-error.tsx`) and workspace (`src/app/app/error.tsx`) error boundaries.
- Unit test script (`pnpm test` via `node --test src/**/*.test.ts`) in `package.json`.
- Project changelog (`CHANGELOG.md`).
- Field Notes PWA installation guide at `/blog/install-fold-as-offline-pwa`.

### Changed
- Synchronized `AGENTS.md`, `README.md`, `SECURITY.md`, `public/llms.txt`, `public/llms-full.txt`, and `/privacy` (`src/app/privacy/page.tsx`) with current commands, routes, shortcuts (`/` search focus, `⌘K` and `⌘/` scopes), self-hosted fonts (`Instrument Sans` and `JetBrains Mono` only), and local storage keys (`fold.folders.v1`).
- Updated `AGENTS.md` specialist persona references to `docs/*.md` and added Directory Map, Architectural Boundaries, and Definition of Done sections.

### Security
- Added `Strict-Transport-Security` and `Content-Security-Policy` (enforcing `connect-src 'self'` and `frame-ancestors 'none'`) to HTTP response headers in `next.config.ts`.
- Hardened legacy HTML normalization and JSON/Markdown import validation with `DOMParser` sanitization and stricter schema guards.

## [0.1.0] - Engine 2.0

### Added
- Local-first IndexedDB storage engine (`fold_db` v2) with `localStorage` emergency mirror (`fold.notes.v1`), custom folder persistence (`fold.folders.v1`), and `navigator.storage.persist()` eviction protection.
- Real-time multi-tab synchronization over `BroadcastChannel` (`fold_sync_v2`).
- TipTap v3 rich-text workspace (`/app`) with headings, task checklists, highlights, safe links, read-only note locking, pinning, Trash soft-delete, Command Palette (`⌘K`), Zen focus mode (`⌘.`), and keyboard shortcuts.
- Bidirectional CommonMark/GFM Markdown conversion, single-note `.md` export/copy, full `.json` backup/restore, and folder-structured `.zip` vault export (`JSZip`).
- Warm Paper (`#f4f0e6`) and Obsidian Ink (`#141511`) themes (`fold.theme.v1`) with circular View Transitions and synthesized Web Audio micro-haptics (`fold.sound.v1`).
- Installable offline PWA (`/manifest.webmanifest`, `/sw.js`), landing page showcase (`/`), Field Notes MDX blog (`/blog`), `/privacy`, and `/terms`.
