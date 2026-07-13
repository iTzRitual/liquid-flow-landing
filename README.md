# Liquid Flow — landing page

Landing page dla [Liquid Flow](https://github.com/iTzRitual/liquid-flow) —
open-source'owej synchronizacji szablonów Liquid dla Comarch e-Sklep.

## Stack

- **Next.js 14** (App Router, React 18) + **Tailwind CSS 3** + **Motion** (Framer Motion v12, pakiet `motion`)
- Język: PL z przełącznikiem EN (prosty słownik w `src/i18n/`)

## Wbudowana prawdziwa aplikacja

Hero renderuje **prawdziwe komponenty aplikacji desktopowej** — design system
z `liquid-sync-mac/apps/desktop/renderer/src/design-system` jest zwendorowany
do `src/vendor/design-system` (tokens.css + prop-driven komponenty TSX, bez
Electrona). Demo jest klikalne: zakładki Aktywność / Konflikty / Git-Backup,
rozwiązywanie konfliktów, checkpoint / push, wybór sklepu.

Po zmianach w design systemie aplikacji odśwież kopię:

```bash
npm run sync-ds          # rsync z ../liquid-sync-mac (lub $LIQUID_FLOW_REPO)
```

Konfiguracja Tailwinda scala mapowania `--ds-*` z `tailwind.ds.config.js`
aplikacji — patrz `tailwind.config.js`.

## Sekcje

1. **Hero** — nagłówek + w połowie widoczne okno aplikacji (macOS chrome), pętla hot-reloadu w logu
2. **CLI** — przyklejony ciemny terminal macOS; scroll przełącza scenki TUI (`/connect`, hot-reload, `/conflicts`, `/git`)
3. **MCP** — mockowana rozmowa z agentem AI rozwiązującym konflikty przez narzędzia MCP

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # statyczny build produkcyjny
```
