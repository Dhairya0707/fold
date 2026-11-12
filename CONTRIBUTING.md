# Contributing to Fold

Thank you for helping improve Fold. Because Fold is a calm, local-first writing tool, changes should prioritize simplicity, zero network tracking, keyboard ergonomics, and crisp accessibility.

## Development Setup

```bash
pnpm install
pnpm dev
```

## Before Opening a Pull Request

1. Keep changes focused and preserve Fold's zero-telemetry, zero-cookie, local-first design.
2. Avoid adding shortcuts that collide with reserved browser or OS bindings (such as `⌘N`, `⌘T`, `⌘⇧T`, `⌘⇧F`, `⌘⇧H`).
3. Run all checks cleanly before submitting:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

4. If your change alters UI, verify both **Paper** (light) and **Ink** (dark) themes across desktop and mobile viewports.

## Reporting Issues

Please include:
- Browser and OS version
- Steps to reproduce
- Any console errors or screenshots (when relevant)
