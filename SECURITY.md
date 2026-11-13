# Security Policy

## Local-first security model

Fold runs strictly inside the client browser sandbox.

Notes, folders, and tags are stored locally in IndexedDB (`fold_db` v2) and mirrored in `localStorage` (`fold.notes.v1`), alongside custom folder lists (`fold.folders.v1`) and local UI preferences (`fold.theme.v1`, `fold.sound.v1`, `fold.lastBackupDate`). None of this data is transmitted to a backend server.

Fold ships without analytics SDKs, ad pixels, or external runtime font CDNs. Only `Instrument Sans` and `JetBrains Mono` are self-hosted via `next/font/google`.

Markdown conversion (`src/lib/storage/markdown.ts`) escapes HTML and validates URL schemes (`http:`, `https:`, `mailto:`, `/`) to block `javascript:` or `data:` XSS payloads. Editor links enforce safe schemes and `rel="noopener noreferrer"`. Legacy HTML and JSON note imports (`src/lib/storage/idb.ts` and `src/lib/storage/markdown.ts`) use `DOMParser` sanitization and schema/type validation before persisting to IndexedDB.

All routes in `firebase.json` and `next.config.ts` serve `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security`, and a `Content-Security-Policy` enforcing `connect-src 'self'` and `frame-ancestors 'none'`.

## Reporting a vulnerability

If you discover a security issue (such as XSS in Markdown import/export, link handling, or service worker caching), report it privately to `support.dhairyadarji@gmail.com` before disclosing publicly.

Include reproduction steps and affected browser versions. You will receive a response as soon as possible.
