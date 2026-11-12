# Security Policy

## Local-First Security Model

Fold runs strictly inside the client browser sandbox:

- **Zero Server Storage:** Notes, folders, and tags are stored locally in IndexedDB (`fold_db`) and mirrored in `localStorage` (`fold.notes.v1`) — never transmitted to a backend server.
- **No Telemetry or Third-Party Scripts:** Fold ships without analytics SDKs, ad pixels, or external runtime font CDNs.
- **Sanitized Content Boundaries:** Markdown imports (`src/lib/storage/markdown.ts`) escape HTML and validate URL schemes (`http:`, `https:`, `mailto:`, `/`) to block `javascript:` or `data:` XSS payloads, and editor links enforce safe schemes and `rel="noopener noreferrer"`.

## Reporting a Vulnerability

If you discover a security issue (such as XSS in Markdown import/export, link handling, or service worker caching), please report it privately before disclosing publicly:

- **Email:** `support.dhairyadarji@gmail.com`

Please include reproduction steps and affected browser versions. You will receive a response as soon as possible.
