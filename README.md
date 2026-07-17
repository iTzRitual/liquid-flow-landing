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
4. **Get started** — tutorial uruchomienia ze źródeł: wspólny terminal clone/install z przyciskiem kopiowania, przełącznik Aplikacja | CLI podmieniający kroki (crossfade)
5. **Open Source** — zaproszenie do współtworzenia: CTA „Gwiazdka na GitHubie" + karty issues / good first issues

## O aplikacji / jak uruchomić aplikację

[Liquid Flow](https://github.com/iTzRitual/liquid-flow) to open-source'owe narzędzie
do synchronizacji szablonów Liquid dla Comarch e-Sklep: hot-reload z dysku prosto do
sklepu, wykrywanie i rozwiązywanie konfliktów, wersjonowanie w Git oraz serwer MCP dla
agentów AI. Monorepo: aplikacja desktopowa, CLI i serwer MCP na wspólnym core.

Aplikacja nie jest dystrybuowana jako paczka (brak DMG/releasów, nie ma jej na npm) —
uruchamia się ją ze źródeł. Wymagany Node.js 20+; Git opcjonalnie (tylko dla
funkcji wersjonowania).

```bash
git clone https://github.com/iTzRitual/liquid-flow.git
cd liquid-flow
npm install      # instaluje wszystkie workspace'y

npm run dev      # aplikacja desktopowa (Vite + Electron, hot-reload)
npm run cli      # interaktywne CLI
# CLI globalnie: npm link --workspace @liquidflow/cli && liquidflow
```

Pierwsze uruchomienie: dodaj sklep (nazwa, URL sklepu, hasło webmastera — loginem jest
zawsze `webmaster`), wybierz szablon — pliki pobiorą się lokalnie i ruszy synchronizacja
na żywo. W CLI `/` otwiera paletę komend: `/connect`, `/templates`, `/conflicts`,
`/git`, `/open`, `/exit`.

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # statyczny build produkcyjny
```
