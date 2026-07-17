export type Lang = 'pl' | 'en';

const pl = {
    nav: {
      features: 'Możliwości',
      cli: 'CLI',
      mcp: 'MCP',
      github: 'GitHub',
    },
    hero: {
      title1: 'Synchronizacja szablonów',
      title2: 'Comarch e-Sklep. Dla ludzi i agentów.',
      subtitle:
        'Hot-reload z edytora prosto do sklepu, konflikty pod kontrolą i kopia zapasowa w Git. Open source — na macOS, Windows i Linuksie.',
      newLabel: 'Nowość',
      newLink: 'Serwer MCP dla agentów AI',
      ctaPrimary: 'Pobierz z GitHub',
      ctaSecondary: 'Zobacz jak działa',
    },
    demo: {
      shopsLabel: 'Sklepy',
      addShop: 'Dodaj sklep',
      id: 'ID',
      ok: 'Brak konfliktów',
      openFolder: 'Otwórz folder',
      openShop: 'Otwórz sklep',
      refresh: 'Odśwież',
      files: 'Pliki',
      tabActivity: 'Aktywność',
      tabConflicts: 'Konflikty',
      tabGit: 'Git-Backup',
      emptyLog: 'Brak aktywności',
      conflictsTitle: 'Wykryte konflikty',
      conflictsEmpty: 'Wszystkie konflikty rozwiązane ✨',
      pull: 'Pobierz',
      push: 'Nadpisz',
      conflictLocal: 'lokalny nowszy',
      conflictRemote: 'zmieniony w panelu',
      conflictLocalMissing: 'brak lokalnie',
      gitBranch: 'Gałąź',
      gitAutoCommit: 'Auto-commit',
      gitCheckpoint: 'Checkpoint',
      gitPush: 'Push',
      gitHistory: 'Historia',
      gitCommitsAhead: (n: number) => `${n} commity przed main`,
    },
    cli: {
      heading: 'Wolisz terminal? Jest i CLI.',
      subtitle:
        'Komenda `liquidflow` uruchamia pełny interfejs w terminalu — status sklepu, log na żywo i paleta slash-komend z autouzupełnianiem.',
      steps: [
        {
          title: 'Dodaj sklep jednym formularzem',
          body: 'Pierwsze `/connect` otwiera „Dodaj nowe połączenie" — krótki formularz: nazwa, URL sklepu i hasło webmastera. Zapisz hasło, by następnym razem łączyć się jednym Enterem.',
        },
        {
          title: 'Połącz i wybierz szablon',
          body: '`/connect` loguje przez to samo API SOAP co oryginalny Liquid Sync, a potem wybierasz szablon do pracy. Sesja trwa, dopóki jej nie zamkniesz — Ctrl+C jest celowo ignorowany.',
        },
        {
          title: 'Hot-reload prosto z edytora',
          body: 'Zapisujesz plik — Liquid Flow natychmiast wysyła go do sklepu. Każde zdarzenie widzisz w logu na żywo.',
        },
        {
          title: 'Konflikty pod kontrolą',
          body: '`/conflicts` pokazuje różnice między wersją lokalną a panelem administracyjnym. Pobierz, nadpisz albo rozwiąż zbiorczo.',
        },
        {
          title: 'Git jako siatka bezpieczeństwa',
          body: '`/git` wersjonuje folder szablonu: auto-commit po każdej zmianie, checkpointy, historia i push na GitHub.',
        },
      ],
    },
    mcp: {
      heading: 'Trzeci tryb: agent AI przez MCP',
      subtitle:
        'Serwer MCP w Liquid Flow pozwala agentom (Claude Code, Claude Desktop) sterować synchronizacją. Poproś agenta, a on sam sprawdzi konflikty, rozwiąże je i wprowadzi zmiany prosto w sklepie.',
      inputPlaceholder: 'Napisz do agenta…',
    },
    openSource: {
      heading: 'Współtwórz Liquid Flow',
      subtitle: 'Kod jest w całości otwarty — sklonuj repozytorium i zacznij działać.',
      copyLabel: 'Kopiuj',
      copiedLabel: 'Skopiowano',
      nodeNote: 'Wymaga Node.js 20 lub nowszego.',
      cards: [
        {
          title: 'Zgłoś błąd lub pomysł',
          description: 'Znalazłeś błąd albo masz pomysł na nową funkcję? Otwórz issue na GitHubie.',
        },
        {
          title: 'Dobre na początek',
          description: 'Wybierz issue oznaczone „good first issue” i zrób swój pierwszy commit.',
        },
        {
          title: 'Zostaw gwiazdkę',
          description: 'Podoba Ci się projekt? Gwiazdka na GitHubie pomaga innym go znaleźć.',
        },
      ],
    },
    footer: {
      tagline: 'Open source, MIT. Zbudowane z frustracji, z miłości do macOS.',
      disclaimer:
        'Liquid Flow to niezależny projekt open source. Nie jest powiązany z Comarch S.A. „Comarch" i „Comarch e-Sklep" są znakami towarowymi ich właścicieli.',
    },
};

export type Dictionary = typeof pl;

const en: Dictionary = {
    nav: {
      features: 'Features',
      cli: 'CLI',
      mcp: 'MCP',
      github: 'GitHub',
    },
    hero: {
      title1: 'The template sync system',
      title2: 'for Comarch e-Sklep. For people and agents.',
      subtitle:
        'Hot-reload from your editor straight to the shop, conflicts under control and Git backup. Open source — on macOS, Windows and Linux.',
      newLabel: 'New',
      newLink: 'MCP server for AI agents',
      ctaPrimary: 'Get it on GitHub',
      ctaSecondary: 'See how it works',
    },
    demo: {
      shopsLabel: 'Shops',
      addShop: 'Add shop',
      id: 'ID',
      ok: 'No conflicts',
      openFolder: 'Open folder',
      openShop: 'Open shop',
      refresh: 'Refresh',
      files: 'Files',
      tabActivity: 'Activity',
      tabConflicts: 'Conflicts',
      tabGit: 'Git-Backup',
      emptyLog: 'No activity',
      conflictsTitle: 'Detected conflicts',
      conflictsEmpty: 'All conflicts resolved ✨',
      pull: 'Pull',
      push: 'Overwrite',
      conflictLocal: 'local is newer',
      conflictRemote: 'changed in admin panel',
      conflictLocalMissing: 'missing locally',
      gitBranch: 'Branch',
      gitAutoCommit: 'Auto-commit',
      gitCheckpoint: 'Checkpoint',
      gitPush: 'Push',
      gitHistory: 'History',
      gitCommitsAhead: (n: number) => `${n} commits ahead of main`,
    },
    cli: {
      heading: 'Prefer the terminal? There is a CLI.',
      subtitle:
        'The `liquidflow` command opens a full terminal UI — shop status, live log and a slash-command palette with autocompletion.',
      steps: [
        {
          title: 'Add a shop with one form',
          body: 'Your first `/connect` opens "Add new connection" — a short form: name, shop URL and webmaster password. Save the password to reconnect with a single Enter next time.',
        },
        {
          title: 'Connect and pick a template',
          body: '`/connect` signs in over the same SOAP API as the original Liquid Sync, then you pick the template to work on. The session stays alive until you end it — Ctrl+C is ignored on purpose.',
        },
        {
          title: 'Hot-reload straight from your editor',
          body: 'Save a file — Liquid Flow pushes it to the shop instantly. Every event shows up in the live log.',
        },
        {
          title: 'Conflicts under control',
          body: '`/conflicts` shows what differs between your local copy and the admin panel. Pull, overwrite, or resolve in bulk.',
        },
        {
          title: 'Git as a safety net',
          body: '`/git` versions the template folder: auto-commit on every change, checkpoints, history and push to GitHub.',
        },
      ],
    },
    mcp: {
      heading: 'A third mode: AI agents over MCP',
      subtitle:
        'Liquid Flow ships an MCP server so agents (Claude Code, Desktop) can drive the sync. Ask the agent — it will check conflicts, resolve them and apply your changes straight to the shop.',
      inputPlaceholder: 'Tell the agent what to do…',
    },
    openSource: {
      heading: 'Contribute to Liquid Flow',
      subtitle: 'The code is fully open — clone the repo and start hacking.',
      copyLabel: 'Copy',
      copiedLabel: 'Copied',
      nodeNote: 'Requires Node.js 20 or later.',
      cards: [
        {
          title: 'Report a bug or request a feature',
          description: 'Found a bug or have an idea for a new feature? Open an issue on GitHub.',
        },
        {
          title: 'Good first issues',
          description: 'Pick an issue labeled "good first issue" and make your first commit.',
        },
        {
          title: 'Star the repo',
          description: 'Like the project? A star on GitHub helps others discover it.',
        },
      ],
    },
    footer: {
      tagline: 'Open source, MIT. Built out of frustration, with love for macOS.',
      disclaimer:
        'Liquid Flow is an independent open-source project. It is not affiliated with Comarch S.A. "Comarch" and "Comarch e-Sklep" are trademarks of their respective owners.',
    },
};

export const dictionaries: Record<Lang, Dictionary> = { pl, en };
