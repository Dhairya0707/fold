# AGENTS.md — Project Operating Manual & Specialist Roles

## 1. Commands (Run & Verify Before Finishing Any Task)

- Install: `<e.g., pnpm install>`
- Dev: `<e.g., pnpm dev>`
- Typecheck & Lint: `<e.g., pnpm lint && pnpm typecheck>`
- Test: `<e.g., pnpm test>`
- Build: `<e.g., pnpm build>`

## 2. Core Guardrails

- Read relevant files before editing; never guess file paths or APIs.
- Keep diffs minimal, typed, and aligned with existing project patterns.
- Never commit secrets, `.env` files, or raw debug logs.
- Never add new dependencies without explicit approval.

## 3. Specialist Role Routing

When asked to perform a specialized review or task, load and strictly follow the corresponding persona file:

- **Security Audit** (`@security`): Follow `.agents/security-auditor.md`
- **UI/UX & Micro-Interactions** (`@ui-ux`): Follow `.agents/ui-ux-director.md`
- **Production Readiness** (`@prod-check`): Follow `.agents/prod-readiness.md`
- **Documentation Sync** (`@docs`): Follow `.agents/docs-manager.md`
