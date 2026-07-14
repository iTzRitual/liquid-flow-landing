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

Styl inspirowany linear.app: near-black (#08090a), Inter semibold z ciasnym trackingiem, minimum koloru.

1. **Hero** — nagłówek po lewej, link „Nowość · MCP →", pełne okno aplikacji (ciemny wariant design systemu) na gradientowej „podłodze" z cieniem i odstępem od kolejnej sekcji
2. **CLI** — sekcja 580vh: przyklejony viewport, terminal stoi w miejscu, a tipy podmieniają się na breakpointach scrolla (blur + przesunięcie z prawej do lewej). Terminal to replika 1:1 prawdziwego TUI z `apps/cli` (baner z tęczowym gradientem, status header, log, paleta slash-komend, overlay konfliktów i menu Git) — nie resetuje się, tylko dopisuje log i „wpisuje" komendy w prompt
3. **MCP** — interaktywny czat o stałej wysokości: agent znajduje 2 konflikty, analizuje różnice, użytkownik wybiera strategię (przyciski, auto-wybór po 6,5 s), agent robi merge + checkpoint

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # statyczny build produkcyjny
```
