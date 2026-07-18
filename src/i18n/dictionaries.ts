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
          title: 'Cała aplikacja w jednym terminalu',
          body: 'Komenda `liquidflow` uruchamia pełny interfejs: status sklepu, log synchronizacji na żywo i paletę slash-komend. Wpisz `/`, aby połączyć sklep, wybrać szablon, rozwiązać konflikty albo cofnąć zmiany przez Git — bez wychodzenia z terminala.',
        },
        {
          title: 'Pierwsze uruchomienie? Dodaj sklep',
          body: 'Przy pierwszym starcie Liquid Flow poprosi o dane sklepu: nazwę, URL i hasło webmastera z panelu Comarch e-Sklep. Zapisz hasło, by łączyć się jednym Enterem, albo zaimportuj gotową listę sklepów z pliku — a zaraz po zalogowaniu zobaczysz swoje szablony.',
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
    getStarted: {
      heading: 'Zacznij w kilka minut',
      subtitle:
        'Pobierz gotową aplikację albo zainstaluj CLI z npm — i połącz się ze swoim sklepem w kilka minut.',
      requirements: 'Wymagany Node.js 20+. Git jest opcjonalny — przydaje się tylko do funkcji wersjonowania.',
      copyLabel: 'Kopiuj',
      copiedLabel: 'Skopiowano',
      tabDesktop: 'Aplikacja',
      tabCli: 'CLI',
      download: {
        mac: 'Pobierz dla macOS',
        windows: 'Pobierz dla Windows',
        linux: 'Pobierz dla Linuksa',
      },
      downloadOther: 'Pozostałe platformy',
      platforms: [
        { name: 'macOS', hint: '.dmg' },
        { name: 'Windows', hint: '.exe' },
        { name: 'Linux', hint: '.AppImage' },
      ],
      desktopSteps: [
        {
          title: 'Pobierz aplikację',
          body: 'Na macOS otwórz plik DMG i przeciągnij Liquid Flow do Aplikacji.',
        },
        {
          title: 'Dodaj sklep',
          body: 'Podaj nazwę, adres sklepu i hasło webmastera z panelu Comarch e-Sklep — loginem jest zawsze `webmaster`.',
        },
        {
          title: 'Wybierz szablon',
          body: 'Pliki szablonu pobiorą się na dysk i od razu ruszy synchronizacja na żywo.',
        },
      ],
      cliSteps: [
        {
          title: 'Zainstaluj CLI',
          body: 'Jedna komenda z npm — potem odpalasz po prostu `liquidflow`.',
          code: ['npm install -g @liquidflow/cli', 'liquidflow'],
        },
        {
          title: 'Otwórz paletę komend',
          body: 'Naciśnij `/`, a CLI podpowie wszystkie komendy z autouzupełnianiem.',
        },
        {
          title: 'Poznaj kluczowe komendy',
          body: '`/connect` łączy ze sklepem, `/templates` wybiera szablon, `/conflicts` rozwiązuje konflikty, `/git` wersjonuje, `/open` otwiera folder, `/exit` kończy.',
        },
      ],
    },
    openSource: {
      heading: 'Chcesz współtworzyć?',
      subtitle:
        'Liquid Flow rozwijamy otwarcie, na licencji MIT. Każde issue, pomysł i pull request przybliżają kolejne wydanie — dołącz do nas.',
      starCta: 'Gwiazdka na GitHubie',
      cards: [
        {
          title: 'Zgłoś błąd lub pomysł',
          description: 'Coś nie działa albo czegoś brakuje? Otwórz issue — czytamy każde.',
        },
        {
          title: 'Dobre na początek',
          description: 'Wybierz issue oznaczone „good first issue” i zrób z nami swój pierwszy commit.',
        },
      ],
      collab: {
        heading: 'Potrzebujesz czegoś podobnego?',
        pitch:
          'Jestem Natan Mokrzycki, autor Liquid Flow. Buduję na zamówienie aplikacje webowe, dedykowane narzędzia i integracje — jeśli szukasz kogoś, kto zrobi to porządnie, odezwij się.',
        ctaEmail: 'Napisz do mnie',
        ctaLinkedin: 'LinkedIn',
      },
    },
    footer: {
      contact: 'Kontakt',
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
          title: 'The whole app in one terminal',
          body: 'The `liquidflow` command opens a full interface: shop status, a live sync log and a slash-command palette. Type `/` to connect a shop, pick a template, resolve conflicts or roll back with Git — without leaving the terminal.',
        },
        {
          title: 'First run? Add your shop',
          body: 'On first launch Liquid Flow asks for your shop details: name, URL and the webmaster password from the Comarch e-Sklep panel. Save the password to reconnect with a single Enter, or import a ready-made shop list from a file — and right after signing in you\'ll see your templates.',
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
    getStarted: {
      heading: 'Up and running in minutes',
      subtitle:
        'Download the packaged app or install the CLI from npm — and connect your shop in minutes.',
      requirements: 'Requires Node.js 20+. Git is optional — only needed for the versioning feature.',
      copyLabel: 'Copy',
      copiedLabel: 'Copied',
      tabDesktop: 'Desktop app',
      tabCli: 'CLI',
      download: {
        mac: 'Download for macOS',
        windows: 'Download for Windows',
        linux: 'Download for Linux',
      },
      downloadOther: 'Other platforms',
      platforms: [
        { name: 'macOS', hint: '.dmg' },
        { name: 'Windows', hint: '.exe' },
        { name: 'Linux', hint: '.AppImage' },
      ],
      desktopSteps: [
        {
          title: 'Download the app',
          body: 'On macOS, open the DMG and drag Liquid Flow to Applications.',
        },
        {
          title: 'Add your shop',
          body: 'Enter a name, the shop URL and the webmaster password from the Comarch e-Sklep panel — the login is always `webmaster`.',
        },
        {
          title: 'Pick a template',
          body: 'The template files download to your disk and live sync starts right away.',
        },
      ],
      cliSteps: [
        {
          title: 'Install the CLI',
          body: 'One command from npm — then just run `liquidflow`.',
          code: ['npm install -g @liquidflow/cli', 'liquidflow'],
        },
        {
          title: 'Open the command palette',
          body: 'Press `/` and the CLI suggests every command with autocompletion.',
        },
        {
          title: 'Learn the key commands',
          body: '`/connect` connects a shop, `/templates` picks a template, `/conflicts` resolves conflicts, `/git` versions your work, `/open` opens the local folder, `/exit` quits.',
        },
      ],
    },
    openSource: {
      heading: 'Want to contribute?',
      subtitle:
        'Liquid Flow is built in the open, MIT-licensed. Every issue, idea and pull request brings the next release closer — join in.',
      starCta: 'Star on GitHub',
      cards: [
        {
          title: 'Report a bug or request a feature',
          description: 'Something broken or missing? Open an issue — we read every one.',
        },
        {
          title: 'Good first issues',
          description: 'Pick an issue labeled "good first issue" and make your first commit with us.',
        },
      ],
      collab: {
        heading: 'Need something like this?',
        pitch:
          "I'm Natan Mokrzycki, the author of Liquid Flow. I build web apps, bespoke tools and integrations on commission — if you need someone who does it properly, get in touch.",
        ctaEmail: 'Get in touch',
        ctaLinkedin: 'LinkedIn',
      },
    },
    footer: {
      contact: 'Contact',
      tagline: 'Open source, MIT. Built out of frustration, with love for macOS.',
      disclaimer:
        'Liquid Flow is an independent open-source project. It is not affiliated with Comarch S.A. "Comarch" and "Comarch e-Sklep" are trademarks of their respective owners.',
    },
};

export const dictionaries: Record<Lang, Dictionary> = { pl, en };
