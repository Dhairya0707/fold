# Security Policy

## Local-First Security Model

Fold runs strictly inside the client browser sandbox:

- **Zero Server Storage:** Notes, folders, and tags are stored locally in IndexedDB (`fold_db` v2) and mirrored in `localStorage` (`fold.notes.v1`), alongside custom folder lists (`fold.folders.v1`) and local UI preferences (`fold.theme.v1`, `fold.sound.v1`, `fold.lastBackupDate`) — never transmitted to a backend server.
- **No Telemetry or Third-Party Scripts:** Fold ships without analytics SDKs, ad pixels, or external runtime font CDNs (only `Instrument Sans` and `JetBrains Mono` are self-hosted via `next/font/google`).
- **Sanitized Content & Import Validation:** Markdown conversion (`src/lib/storage/markdown.ts`) escapes HTML and validates URL schemes (`http:`, `https:`, `mailto:`, `/`) to block `javascript:` or `data:` XSS payloads, editor links enforce safe schemes and `rel="noopener noreferrer"`, and legacy HTML/JSON note imports (`src/lib/storage/idb.ts` and `src/lib/storage/markdown.ts`) use `DOMParser` sanitization and schema/type validation before persisting to IndexedDB.
- **HTTP Security Headers (`firebase.json` & `next.config.ts`):** All routes serve `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security`, and a `Content-Security-Policy` enforcing `connect-src 'self'` and `frame-ancestors 'none'`.

## Reporting a Vulnerability

If you discover a security issue (such as XSS in Markdown import/export, link handling, or service worker caching), please report it privately before disclosing publicly:

- **Email:** `support.dhairyadarji@gmail.com`

Please include reproduction steps and affected browser versions. You will receive a response as soon as possible.
