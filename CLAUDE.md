# CLAUDE.md

Guidance for working in this repository.

## What this is

**Landing page for Liquid Flow** — a marketing/product page built with **Next.js 14**
(App Router, React 18) + **Tailwind CSS 3** + **Motion** (Framer Motion v12, the `motion`
package). The site is bilingual: Polish by default with an EN toggle (simple dictionary in
`src/i18n/`, no i18n framework).

The product itself is **not** in this repo. It lives in the sibling checkout:

```
../liquid-sync-mac      (a.k.a. the "liquid-flow" monorepo)
```

That monorepo contains the real desktop app, CLI, and MCP server on a shared core:

- `apps/desktop/renderer/src/design-system` — the real design system (tokens + components)
- `apps/cli` — the interactive terminal UI (banner, slash-command palette, conflict/Git flows)
- `apps/mcp` — the MCP server for AI agents

## The demos mirror the real product — go look at the source

This landing does **not** fake screenshots. Its interactive demos are built from the real
app's code and behavior, so when you touch a demo you **can and should peek at
`../liquid-sync-mac`** to verify shapes, wording, flows, and visuals:

- **Embedded desktop app (Hero)** — the design system is *vendored* from
  `../liquid-sync-mac/apps/desktop/renderer/src/design-system` into
  `src/vendor/design-system` (tokens.css + prop-driven TSX, no Electron). Re-vendor after
  upstream changes:
  ```bash
  npm run sync-ds          # rsync from ../liquid-sync-mac (override with $LIQUID_FLOW_REPO)
  ```
  `scripts/sync-ds.sh` does a `--delete` rsync excluding stories/tests. **Never hand-edit
  files under `src/vendor/design-system/`** — they are overwritten by the sync. Fix the
  upstream repo and re-sync instead. `tailwind.config.js` merges the app's
  `foundations/tailwind.ds.config.js` (`--ds-*` mappings).

- **CLI section (`Terminal.tsx`)** — a 1:1 replica of the real TUI in
  `../liquid-sync-mac/apps/cli` (rainbow-gradient banner, status header, log, slash-command
  palette, conflict overlay, Git menu). If you change its output or commands, check the
  real CLI (`apps/cli/src/App.jsx`, `banner.js`, `commands.js`) for fidelity.

- **MCP section (`McpSection.tsx`, `mcpScenarios.ts`)** — a scripted chat that reproduces the
  real agent flow (find conflicts → analyze diffs → pick strategy → merge + checkpoint).
  Verify against `apps/mcp` behavior.

- **Demo fixtures (`src/components/demo/demoData.ts`)** — sample shops, file trees, and log
  scripts whose **shapes intentionally match the design-system props** (`SidebarShop`,
  `FileTreeNode`, `ActivityLogEntry`) so the vendored components render exactly as in the
  real app. Keep them in sync with the upstream prop types.

**Bottom line:** whenever the truth of a demo is in question — a prop shape, a CLI string, a
color token, a flow step — the authoritative source is `../liquid-sync-mac`, not this repo.
Read it before guessing.

## Structure

```
app/
  layout.tsx, page.tsx        # App Router entry; page.tsx composes the sections in order
  globals.css
src/
  components/
    Navbar.tsx, Footer.tsx
    sections/                 # the landing sections (see below)
      Hero.tsx                # header + embedded real desktop app
      CliSection.tsx, Terminal.tsx, CopyButton.tsx
      McpSection.tsx, mcpScenarios.ts
      GetStartedSection.tsx
      OpenSourceSection.tsx
    demo/                     # clickable desktop-app demo used by the Hero
      AppDemo.tsx, ConflictsTab.tsx, GitTab.tsx, demoData.ts
  i18n/
    LanguageProvider.tsx, dictionaries.ts   # PL default, EN toggle
  vendor/
    design-system/            # VENDORED from ../liquid-sync-mac — do not edit by hand
scripts/sync-ds.sh            # re-vendors the design system
public/                       # hero imagery, avatar
```

### Page sections (order in `app/page.tsx`)

1. **Hero** — headline + full desktop app window (dark DS variant) on a gradient "floor".
   The app is clickable: Activity / Conflicts / Git-Backup tabs, conflict resolution,
   checkpoint/push, shop picker.
2. **CLI** — tall pinned-scroll section: terminal stays fixed while tips swap on scroll
   breakpoints; the terminal appends log lines and "types" commands (it does not reset).
3. **MCP** — fixed-height interactive chat (agent resolves 2 conflicts; auto-picks a
   strategy after ~6.5 s if the user doesn't).
4. **Get started** — install steps: desktop app from GitHub Releases vs. CLI from npm,
   with an App | CLI toggle (crossfade).
5. **Open Source** — contribution CTA + issues / good-first-issues cards.

The visual style is Linear-inspired: near-black (`#08090a`), Inter semibold with tight
tracking, minimal color.

## Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
npm run sync-ds    # re-vendor design system from ../liquid-sync-mac
```

## Notes on the product being marketed

The landing presents the *target* distribution (GitHub Releases for the desktop app, npm
`@liquidflow/cli` for the CLI). As of now that distribution is **not yet published** — the
real app runs from source (Node 20+, Git optional). Keep marketing copy consistent with
what actually ships; if in doubt, check `../liquid-sync-mac/README.md`.

## Conventions

- Match the existing near-black Linear aesthetic and the vendored design tokens.
- Keep PL and EN dictionary entries in sync when adding copy.
- Prefer verifying against `../liquid-sync-mac` over inventing product details.
