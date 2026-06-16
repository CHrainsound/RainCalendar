# AGENTS.md

## Project

Zepp OS mini-program (小程序) — a "Hello World" app for Amazfit smartwatches using Zepp OS 4.x.

## Key files

- `app.json` — app config: targets, permissions, i18n, API level. This is the single source of truth for build targets.
- `app.js` — app entry point (lifecycle hooks only).
- `page/gt/home/index.page.js` — page logic, uses `@zos/ui` for widgets.
- `page/gt/home/index.page.{s,r}.layout.js` — platform-specific layout definitions (`s` = small/round screen, `r` = round). The page imports layout via `zosLoader:./index.page.[pf].layout.js` (runtime resolves `[pf]`).
- `utils/index.js` — shared utility helpers.

## Conventions

- **Platform-specific files**: Layouts use `.s.layout.js` (small) and `.r.layout.js` (round) suffixes. Assets mirror this with `gt.s/` and `gt.r/` directories. Adding a new layout requires matching both suffixes.
- **Imports**: `@zos/ui`, `@zos/utils`, `@zos/i18n`, `@zos/device` are Zepp OS device-side modules (not npm packages — resolved at runtime).
- **i18n**: `.po` files in `page/i18n/`. Use `getText("key")` from `@zos/i18n`.
- **Type checking**: `jsconfig.json` with `checkJs: true` and `@zeppos/device-types` for IDE support. Not enforced at build time.

## Build & Dev

This project uses the **Zepp CLI** (not included in this repo). Commands:
- `zepp build` — builds to `dist/`
- `zepp dev` — starts dev simulator
- `zepp upload` — submits to Zepp console for review

CLI is installed globally: `npm install -g @zeppos/cli`

## Gotchas

- No test framework, linter, or formatter is configured. `package.json` has a placeholder `test` script only.
- `dist/` is build output — do not edit.
- `node_modules/` contains `@zeppos/zml` (ZML framework) — this is the runtime framework, not a typical npm dependency.
- The `assets/` directory contains platform-specific icons and images. File naming must match `app.json` icon references.
- `configVersion` in `app.json` must be `"v3"` for Zepp OS 3+/4.x.
