import type { Lang } from '@/i18n/dictionaries';

/* ————— Scripted agent workflows for the MCP chat demo —————
 *
 * Each scenario is a self-contained conversation: a scripted `intro` that ends
 * at a `{ kind: 'decision' }` point, then three `choices` that each append their
 * own follow-up events. One choice per scenario is flagged `recommended` (the
 * auto-decide fallback). Tool names mirror the real Liquid Flow MCP server
 * (connect_shop, resolve_conflict, git_checkpoint, list_conflicts, …) and each
 * branch references the same files / shops the intro named, so the transcript
 * always reads coherently. The section picks one scenario at random per visit. */

export type ChatEvent =
  | { kind: 'user'; text: string }
  | { kind: 'agent'; text: string }
  | { kind: 'tool'; tool: string; args: string; result: string }
  | { kind: 'decision' };

export interface Choice {
  id: string;
  label: string;
  recommended?: boolean;
  /** Events appended after the visitor picks this choice. */
  events: ChatEvent[];
}

export interface Script {
  intro: ChatEvent[];
  choices: Choice[];
}

/* ————— PL ————— */

const PL: Script[] = [
  /* 1 — resolve conflicts (the original scenario) */
  {
    intro: [
      { kind: 'user', text: 'Sprawdź konflikty w sklepie Ogródek i pomóż mi je rozwiązać.' },
      { kind: 'tool', tool: 'get_mismatches', args: '{}', result: '2 konflikty' },
      { kind: 'agent', text: 'Masz 2 konflikty z panelem administracyjnym. Sprawdzam, co dokładnie się różni…' },
      { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid"', result: 'lokalny nowszy o 2 h' },
      { kind: 'tool', tool: 'preview_conflict', args: '"css/theme.css"', result: 'zmieniony w panelu 20 min temu' },
      {
        kind: 'agent',
        text:
          'header.liquid — Twoja lokalna wersja jest nowsza: przebudowany nagłówek i dodane menu mobilne.\n' +
          'theme.css — zmieniony w panelu: ktoś poprawił kolory przycisków w promocji.\n\n' +
          'Które wersje mam zachować?',
      },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'mixed',
        label: 'Lokalny header, theme ze sklepu',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" → push', result: 'nadpisano wersję w sklepie' },
          { kind: 'tool', tool: 'resolve_conflict', args: '"css/theme.css" → pull', result: 'pobrano wersję z panelu' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"merge: header lokalny, theme z panelu"', result: 'squash wip → main (f3d9a21)' },
          { kind: 'agent', text: 'Gotowe. Nagłówek z menu mobilnym jest już w sklepie, kolory przycisków z panelu zostały pobrane lokalnie, a całość zabezpieczyłem checkpointem na main.' },
        ],
      },
      {
        id: 'local',
        label: 'Zachowaj obie lokalne',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" → push', result: 'nadpisano wersję w sklepie' },
          { kind: 'tool', tool: 'resolve_conflict', args: '"css/theme.css" → push', result: 'nadpisano wersję w sklepie' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"resolve: wersje lokalne"', result: 'squash wip → main (b81c4e0)' },
          { kind: 'agent', text: 'Zrobione — obie lokalne wersje są w sklepie. Uwaga: zmiana kolorów z panelu została nadpisana; masz ją w historii Git, gdyby trzeba było wrócić.' },
        ],
      },
      {
        id: 'remote',
        label: 'Pobierz obie ze sklepu',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" → pull', result: 'pobrano wersję z panelu' },
          { kind: 'tool', tool: 'resolve_conflict', args: '"css/theme.css" → pull', result: 'pobrano wersję z panelu' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"resolve: wersje z panelu"', result: 'squash wip → main (9d2e77c)' },
          { kind: 'agent', text: 'Pobrane — folder lokalny odpowiada teraz sklepowi. Twoja wcześniejsza praca nad nagłówkiem jest bezpieczna w historii Git.' },
        ],
      },
    ],
  },

  /* 2 — upgrade template version */
  {
    intro: [
      { kind: 'user', text: 'Chcę przejść na najnowszą wersję szablonu Topaz w sklepie Ogródek. Zrób to bezpiecznie.' },
      { kind: 'tool', tool: 'list_templates', args: '{}', result: 'Topaz [42] → [46] dostępne' },
      { kind: 'agent', text: 'Masz Topaz [42], najnowszy to [46] (4 wersje różnicy). Najpierw zabezpieczam obecny stan…' },
      { kind: 'tool', tool: 'git_checkpoint', args: '"backup przed Topaz [46]"', result: 'wip → main (a17c4e2)' },
      { kind: 'agent', text: 'Backup zrobiony. Twoje lokalne zmiany dotykają 7 plików, których szablon [46] też dotyka. Jak wgrać nową wersję?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'merge',
        label: 'Wgraj [46], zachowaj moje pliki',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [46]" → merge', result: '121 plików, 7 zachowanych lokalnie' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"upgrade: Topaz [46] + lokalne zmiany"', result: 'wip → main (c9b0f14)' },
          { kind: 'agent', text: 'Gotowe. Szablon [46] jest wgrany, a Twoje 7 zmienionych plików nie zostało nadpisanych. Wszystko w checkpointcie — możesz przetestować i w razie czego cofnąć.' },
        ],
      },
      {
        id: 'clean',
        label: 'Czysta instalacja [46]',
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [46]" → overwrite', result: '121 plików nadpisanych' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"upgrade: czysty Topaz [46]"', result: 'wip → main (2e5a881)' },
          { kind: 'agent', text: 'Wgrany czysty [46]. Twoje wcześniejsze 7 plików zostało nadpisanych — są w historii Git na commitcie a17c4e2, gdybyś chciał odzyskać któryś fragment.' },
        ],
      },
      {
        id: 'dry',
        label: 'Tylko pokaż różnice',
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [46]" → dry-run', result: '34 pliki różne, 7 kolizji' },
          { kind: 'agent', text: 'Nic nie zmieniłem. [46] różni się w 34 plikach; 7 z nich pokrywa się z Twoimi lokalnymi zmianami (m.in. header.liquid, cart.liquid). Daj znać, którą ścieżką iść, a wgram.' },
        ],
      },
    ],
  },

  /* 3 — rollback a broken deploy */
  {
    intro: [
      { kind: 'user', text: 'Nagłówek na sklepie rozjechał się po wczorajszej zmianie. Cofnij to.' },
      { kind: 'tool', tool: 'git_history', args: '{ "path": "components/header.liquid" }', result: '6 zmian, 14 commitów' },
      { kind: 'agent', text: 'Znalazłem. Ostatni dobry stan header.liquid to commit 8fa2c10 z przedwczoraj (14:20), zanim doszła zmiana siatki nagłówka.' },
      { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid" @8fa2c10', result: 'różnica: 1 blok grid' },
      { kind: 'agent', text: 'Mogę przywrócić sam nagłówek albo cały stan sklepu z tamtego checkpointu. Jak wolisz?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'file',
        label: 'Przywróć tylko nagłówek',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" ← 8fa2c10', result: 'przywrócono + push' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"revert: header do 8fa2c10"', result: 'wip → main (7d1e004)' },
          { kind: 'agent', text: 'Nagłówek wrócił do działającej wersji i jest już na sklepie. Reszty wczorajszych zmian nie ruszałem — zostają jak były.' },
        ],
      },
      {
        id: 'all',
        label: 'Cofnij cały wczorajszy checkpoint',
        events: [
          { kind: 'tool', tool: 'git_history', args: '{ "restore": "8fa2c10" }', result: '9 plików przywróconych' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"revert: cały stan do 8fa2c10"', result: 'wip → main (5c3a112)' },
          { kind: 'agent', text: 'Cały sklep wrócił do stanu z przedwczoraj (8fa2c10) i został wypchnięty. Wczorajsze zmiany są bezpieczne w historii, gdybyś chciał wybrać z nich pojedyncze pliki.' },
        ],
      },
      {
        id: 'preview',
        label: 'Najpierw pokaż podgląd',
        events: [
          { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid" @8fa2c10', result: 'usuwa błędny grid, wraca flex' },
          { kind: 'agent', text: 'Nic jeszcze nie zmieniłem. Przywrócenie 8fa2c10 usuwa nowy blok grid i wraca do układu flex — to była właśnie ta psująca zmiana. Powiedz, czy przywracać.' },
        ],
      },
    ],
  },

  /* 4 — connect a second shop */
  {
    intro: [
      { kind: 'user', text: 'Dodaj drugi sklep „Kawa i Ziarno" i przenieś tam ten sam szablon co w Ogródku.' },
      { kind: 'tool', tool: 'list_shops', args: '{}', result: '1 sklep: Ogródek' },
      { kind: 'tool', tool: 'connect_shop', args: '"kawaiziarno.esklep.pl"', result: 'połączono ✓' },
      { kind: 'agent', text: 'Połączyłem „Kawa i Ziarno". Ogródek działa na szablonie Topaz [42] z Twoimi zmianami. Jak przenieść go do nowego sklepu?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'copy',
        label: 'Skopiuj szablon z moimi zmianami',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [42]" → Kawa i Ziarno', result: '128 plików wgranych' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"init: Kawa i Ziarno z Topaz [42]"', result: 'nowy branch (0aa71fd)' },
          { kind: 'agent', text: 'Gotowe. „Kawa i Ziarno" ma teraz identyczny szablon co Ogródek, łącznie z Twoimi zmianami w nagłówku. Nowy sklep dostał osobny branch w Git — historie się nie mieszają.' },
        ],
      },
      {
        id: 'fresh',
        label: 'Wgraj czysty Topaz [42]',
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [42]" → Kawa i Ziarno (czysty)', result: '121 plików wgranych' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"init: Kawa i Ziarno (czysty Topaz)"', result: 'nowy branch (4b2c9e0)' },
          { kind: 'agent', text: 'Nowy sklep dostał czysty szablon Topaz [42], bez Twoich zmian z Ogródka. Możesz go rozwijać niezależnie od tamtego.' },
        ],
      },
      {
        id: 'connect',
        label: 'Na razie tylko połącz',
        events: [
          { kind: 'tool', tool: 'status', args: '"Kawa i Ziarno"', result: 'połączony, brak szablonu' },
          { kind: 'agent', text: 'Sklep jest podłączony i gotowy, ale nie wgrałem żadnego szablonu. Kiedy zechcesz, wystarczy powiedzieć — skopiuję z Ogródka albo wgram świeży.' },
        ],
      },
    ],
  },

  /* 5 — bulk push local changes */
  {
    intro: [
      { kind: 'user', text: 'Mam kilka zapisanych plików lokalnie w Ogródku. Wyślij wszystko do sklepu.' },
      { kind: 'tool', tool: 'git_status', args: '{}', result: '6 plików zmienionych lokalnie' },
      { kind: 'agent', text: 'Widzę 6 zmian: header.liquid, cart.liquid, 3 pliki CSS i product.liquid. Żaden nie koliduje z panelem — panel nie był ruszany od Twojego ostatniego pobrania. Jak wysłać?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'checkpoint',
        label: 'Wyślij i zrób checkpoint',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'all → push (6 plików)', result: 'wysłano, hot-reload ✓' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"deploy: 6 plików do Ogródka"', result: 'wip → main (e6f0a37)' },
          { kind: 'agent', text: 'Wszystkie 6 plików jest w sklepie i widoczne po hot-reload. Zapiąłem checkpoint na main, więc masz jeden punkt, do którego można wrócić, gdyby coś było nie tak.' },
        ],
      },
      {
        id: 'push',
        label: 'Wyślij bez checkpointu',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'all → push (6 plików)', result: 'wysłano, hot-reload ✓' },
          { kind: 'agent', text: 'Wysłane — 6 plików jest w sklepie. Nie robiłem checkpointu; zmiany są na branchu wip, więc gdybyś chciał je utrwalić, powiedz, a zamknę je commitem.' },
        ],
      },
      {
        id: 'review',
        label: 'Najpierw pokaż listę',
        events: [
          { kind: 'tool', tool: 'git_status', args: '{ "diff": true }', result: '6 plików, +214 −38 linii' },
          { kind: 'agent', text: 'Nic nie wysłałem. Największe zmiany są w cart.liquid (+120 linii) i header.liquid. Przejrzyj listę i daj znać, które wysłać — mogę wszystkie albo wybrane.' },
        ],
      },
    ],
  },

  /* 6 — diagnose why sync stopped (logs) */
  {
    intro: [
      { kind: 'user', text: 'Zapisuję pliki, ale zmiany nie pojawiają się w sklepie Ogródek. Sprawdź, co się dzieje.' },
      { kind: 'tool', tool: 'get_logs', args: '{ "level": "error", "limit": 20 }', result: '4× błąd 401 przy upload' },
      { kind: 'tool', tool: 'status', args: '"Ogródek"', result: 'token API wygasł 40 min temu' },
      { kind: 'agent', text: 'Znalazłem. Token API sklepu wygasł 40 minut temu — dlatego każdy upload wraca z błędem 401 i pliki zostają lokalnie. Twoje zmiany są bezpieczne, po prostu czekają w kolejce. Co robimy?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'reconnect',
        label: 'Odśwież połączenie i dokończ wysyłkę',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'connect_shop', args: '"Ogródek" → refresh token', result: 'nowy token ✓' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'queue → push (4 pliki)', result: 'wysłano, hot-reload ✓' },
          { kind: 'agent', text: 'Odświeżyłem token i dosłałem 4 zaległe pliki — są już w sklepie. Kolejka pusta, synchronizacja znów działa na bieżąco.' },
        ],
      },
      {
        id: 'retry',
        label: 'Tylko ponów wysyłkę',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'queue → push (retry)', result: 'nadal 401' },
          { kind: 'agent', text: 'Ponowienie nie pomogło — dalej leci 401, bo token jest wygasły, nie chwilowy problem sieci. Trzeba odświeżyć połączenie ze sklepem; mam to zrobić?' },
        ],
      },
      {
        id: 'logs',
        label: 'Pokaż pełne logi',
        events: [
          { kind: 'tool', tool: 'get_logs', args: '{ "limit": 50 }', result: '4× 401, ostatni upload OK 41 min temu' },
          { kind: 'agent', text: 'Ostatni udany upload był 41 minut temu, tuż przed wygaśnięciem tokenu — po tym same 401. To jednoznacznie wygasła sesja, nie błąd w plikach. Odświeżenie połączenia załatwi sprawę.' },
        ],
      },
    ],
  },

  /* 7 — prune orphaned local files */
  {
    intro: [
      { kind: 'user', text: 'Posprzątaj folder Ogródka — mam tam stare pliki, których nie ma już w szablonie.' },
      { kind: 'tool', tool: 'status', args: '"Ogródek"', result: '3 osierocone pliki lokalne' },
      { kind: 'agent', text: 'Znalazłem 3 pliki, których nie ma już w szablonie sklepu: css/old-hero.css, components/banner-2023.liquid i js/legacy-slider.js. Nic ich nie używa. Co z nimi?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'delete',
        label: 'Usuń, ale najpierw checkpoint',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: '"backup przed sprzątaniem"', result: 'wip → main (b3f7d20)' },
          { kind: 'tool', tool: 'status', args: 'remove 3 orphans', result: 'folder wyczyszczony' },
          { kind: 'agent', text: 'Zrobione. 3 stare pliki zniknęły z folderu, a przed usunięciem zapiąłem checkpoint — gdyby któryś okazał się jeszcze potrzebny, wróci jednym poleceniem z historii.' },
        ],
      },
      {
        id: 'keep',
        label: 'Zostaw je',
        events: [
          { kind: 'agent', text: 'Ok, nic nie ruszam. Te 3 pliki zostają lokalnie; nie trafiają do sklepu, bo szablon ich nie zawiera, więc niczego nie psują — po prostu leżą w folderze.' },
        ],
      },
      {
        id: 'pull',
        label: 'Zsynchronizuj folder ze sklepem',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'sync ← Ogródek', result: 'folder = stan sklepu' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"sync: folder do stanu sklepu"', result: 'wip → main (a802c55)' },
          { kind: 'agent', text: 'Folder lokalny odpowiada teraz dokładnie szablonowi w sklepie — 3 osierocone pliki zostały usunięte przy okazji. Całość zabezpieczona checkpointem.' },
        ],
      },
    ],
  },

  /* 8 — set up GitHub remote backup */
  {
    intro: [
      { kind: 'user', text: 'Chcę mieć backup Ogródka na GitHubie. Ustaw zdalne repo i wypchnij historię.' },
      { kind: 'tool', tool: 'git_status', args: '{}', result: 'remote nieustawiony, 14 commitów' },
      { kind: 'agent', text: 'Lokalnie masz 14 commitów, ale zdalne repo nie jest jeszcze ustawione. Mogę podpiąć GitHub i wypchnąć całą historię jako prywatny backup. Jak to zrobić?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'setpush',
        label: 'Podepnij repo i wypchnij wszystko',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: 'set remote → github.com/…/ogrodek', result: 'remote ustawiony' },
          { kind: 'tool', tool: 'git_history', args: 'push origin main', result: '14 commitów wypchniętych ✓' },
          { kind: 'agent', text: 'Gotowe. Prywatne repo jest podpięte, a wszystkie 14 commitów trafiło na GitHub. Od teraz każdy checkpoint mogę wypychać automatycznie — masz pełny backup poza komputerem.' },
        ],
      },
      {
        id: 'pushonly',
        label: 'Tylko wypchnij, remote już mam',
        events: [
          { kind: 'tool', tool: 'git_history', args: 'push origin main', result: '14 commitów wypchniętych ✓' },
          { kind: 'agent', text: 'Wypchnięte — 14 commitów jest na Twoim istniejącym remote. Historia sklepu ma teraz kopię w chmurze.' },
        ],
      },
      {
        id: 'checkpoint',
        label: 'Najpierw domknij bieżące zmiany',
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: '"checkpoint przed pierwszym pushem"', result: 'wip → main (d40b17e)' },
          { kind: 'agent', text: 'Domknąłem bieżące zmiany checkpointem, żeby backup objął naprawdę wszystko. Teraz wystarczy powiedzieć, a podepnę remote i wypchnę już 15 commitów.' },
        ],
      },
    ],
  },

  /* 9 — copy template from staging shop to production */
  {
    intro: [
      { kind: 'user', text: 'Przenieś zmiany ze sklepu testowego „ModaLena-test" do produkcyjnego „ModaLena".' },
      { kind: 'tool', tool: 'list_shops', args: '{}', result: '2 sklepy: ModaLena, ModaLena-test' },
      { kind: 'tool', tool: 'get_workspace_info', args: 'diff(test → prod)', result: '11 plików różnych' },
      { kind: 'agent', text: 'Test różni się od produkcji w 11 plikach — głównie nowa strona kolekcji i poprawki koszyka. Produkcja nie ma własnych świeżych zmian, więc nic się nie nadpisze przypadkiem. Jak przenieść?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'changed',
        label: 'Przenieś tylko te 11 zmienionych',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '11 plików: test → ModaLena', result: 'wgrano, hot-reload ✓' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"release: ModaLena-test → prod (11 plików)"', result: 'wip → main (f81aa03)' },
          { kind: 'agent', text: 'Wdrożone. Tylko te 11 plików trafiło na produkcję — nowa kolekcja i koszyk są już live. Reszta szablonu produkcyjnego nietknięta, a release zapięty checkpointem.' },
        ],
      },
      {
        id: 'all',
        label: 'Nadpisz produkcję całym testem',
        events: [
          { kind: 'tool', tool: 'select_template', args: 'ModaLena-test → ModaLena (pełny)', result: '124 pliki nadpisane' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"release: pełna kopia test → prod"', result: 'wip → main (30c9b6e)' },
          { kind: 'agent', text: 'Produkcja to teraz dokładna kopia testu — wszystkie 124 pliki. Poprzedni stan produkcji jest w historii Git, gdyby trzeba było wrócić do konkretnego pliku.' },
        ],
      },
      {
        id: 'preview',
        label: 'Pokaż, co dokładnie się zmieni',
        events: [
          { kind: 'tool', tool: 'preview_conflict', args: 'test → prod (11 plików)', result: 'collection.liquid +180, cart.liquid +64' },
          { kind: 'agent', text: 'Nic nie wdrożyłem. Największe zmiany: nowa collection.liquid (+180 linii) i cart.liquid (+64). Pozostałe 9 to drobne poprawki CSS. Powiedz, czy przenosić wszystkie 11, czy wybrane.' },
        ],
      },
    ],
  },

  /* 10 — deploy a promo before a sale */
  {
    intro: [
      { kind: 'user', text: 'Za godzinę startuje wyprzedaż. Mam lokalnie gotowy baner i kolory promocji — wrzuć to na Ogródek.' },
      { kind: 'tool', tool: 'git_status', args: '{}', result: '3 pliki: promo-banner.liquid, theme.css, home.liquid' },
      { kind: 'tool', tool: 'preview_conflict', args: '"css/theme.css"', result: 'lokalny nowszy, brak kolizji' },
      { kind: 'agent', text: 'Gotowe do publikacji: baner promocji, czerwone akcenty w theme.css i sekcja na stronie głównej. Panel nie był ruszany, więc nic się nie nadpisze. Jak wdrażamy przed startem?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'safe',
        label: 'Backup, potem publikuj',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: '"backup przed wyprzedażą"', result: 'wip → main (c05e9a1)' },
          { kind: 'tool', tool: 'resolve_conflict', args: '3 pliki → push', result: 'promo live, hot-reload ✓' },
          { kind: 'agent', text: 'Promocja jest live na Ogródku — baner, kolory i sekcja na home. Przed wdrożeniem zapiąłem checkpoint bez promocji, więc po wyprzedaży cofniesz wszystko jednym poleceniem.' },
        ],
      },
      {
        id: 'now',
        label: 'Publikuj natychmiast',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '3 pliki → push', result: 'promo live, hot-reload ✓' },
          { kind: 'agent', text: 'Wdrożone od ręki — promocja jest już widoczna w sklepie. Zmiany są na branchu wip; kiedy wyprzedaż się skończy, powiedz, a przywrócę wersję bez baneru.' },
        ],
      },
      {
        id: 'preview',
        label: 'Najpierw podgląd baneru',
        events: [
          { kind: 'tool', tool: 'preview_conflict', args: '"components/promo-banner.liquid"', result: '−15% czerwony pasek, sticky top' },
          { kind: 'agent', text: 'Nic jeszcze nie publikuję. Baner to czerwony sticky pasek „−15%" na górze strony, kolory promo są w theme.css. Wygląda spójnie — daj sygnał, a wrzucam całość przed startem.' },
        ],
      },
    ],
  },
];

/* ————— EN ————— */

const EN: Script[] = [
  /* 1 — resolve conflicts (the original scenario) */
  {
    intro: [
      { kind: 'user', text: 'Check the Ogródek shop for conflicts and help me resolve them.' },
      { kind: 'tool', tool: 'get_mismatches', args: '{}', result: '2 conflicts' },
      { kind: 'agent', text: 'You have 2 conflicts with the admin panel. Checking what exactly differs…' },
      { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid"', result: 'local newer by 2 h' },
      { kind: 'tool', tool: 'preview_conflict', args: '"css/theme.css"', result: 'changed in panel 20 min ago' },
      {
        kind: 'agent',
        text:
          'header.liquid — your local version is newer: rebuilt header plus a new mobile menu.\n' +
          'theme.css — changed in the panel: someone tweaked button colors for a promo.\n\n' +
          'Which versions should I keep?',
      },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'mixed',
        label: 'Local header, theme from shop',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" → push', result: 'shop version overwritten' },
          { kind: 'tool', tool: 'resolve_conflict', args: '"css/theme.css" → pull', result: 'panel version pulled' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"merge: local header, panel theme"', result: 'squash wip → main (f3d9a21)' },
          { kind: 'agent', text: 'Done. The header with the mobile menu is live in the shop, the panel button colors are pulled locally, and everything is secured with a checkpoint on main.' },
        ],
      },
      {
        id: 'local',
        label: 'Keep both local',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" → push', result: 'shop version overwritten' },
          { kind: 'tool', tool: 'resolve_conflict', args: '"css/theme.css" → push', result: 'shop version overwritten' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"resolve: local versions"', result: 'squash wip → main (b81c4e0)' },
          { kind: 'agent', text: 'Done — both local versions are in the shop. Note: the panel color change was overwritten; it stays in Git history if you need it back.' },
        ],
      },
      {
        id: 'remote',
        label: 'Pull both from shop',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" → pull', result: 'panel version pulled' },
          { kind: 'tool', tool: 'resolve_conflict', args: '"css/theme.css" → pull', result: 'panel version pulled' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"resolve: panel versions"', result: 'squash wip → main (9d2e77c)' },
          { kind: 'agent', text: 'Pulled — your local folder now matches the shop. Your earlier header work is safe in Git history.' },
        ],
      },
    ],
  },

  /* 2 — upgrade template version */
  {
    intro: [
      { kind: 'user', text: 'I want to move the Ogródek shop to the latest Topaz template. Do it safely.' },
      { kind: 'tool', tool: 'list_templates', args: '{}', result: 'Topaz [42] → [46] available' },
      { kind: 'agent', text: 'You are on Topaz [42], the latest is [46] (4 versions apart). Let me secure the current state first…' },
      { kind: 'tool', tool: 'git_checkpoint', args: '"backup before Topaz [46]"', result: 'wip → main (a17c4e2)' },
      { kind: 'agent', text: 'Backup done. Your local edits touch 7 files that template [46] also changes. How should I apply the new version?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'merge',
        label: 'Install [46], keep my files',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [46]" → merge', result: '121 files, 7 kept local' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"upgrade: Topaz [46] + local edits"', result: 'wip → main (c9b0f14)' },
          { kind: 'agent', text: 'Done. Template [46] is installed and your 7 edited files were not overwritten. It is all in a checkpoint — test it and roll back if anything looks off.' },
        ],
      },
      {
        id: 'clean',
        label: 'Clean install of [46]',
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [46]" → overwrite', result: '121 files overwritten' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"upgrade: clean Topaz [46]"', result: 'wip → main (2e5a881)' },
          { kind: 'agent', text: 'Clean [46] installed. Your earlier 7 files were overwritten — they live in Git history at commit a17c4e2 if you want to recover any part.' },
        ],
      },
      {
        id: 'dry',
        label: 'Just show me the diff',
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [46]" → dry-run', result: '34 files differ, 7 collisions' },
          { kind: 'agent', text: 'Changed nothing. [46] differs in 34 files; 7 overlap with your local edits (header.liquid, cart.liquid, …). Tell me which path to take and I will apply it.' },
        ],
      },
    ],
  },

  /* 3 — rollback a broken deploy */
  {
    intro: [
      { kind: 'user', text: 'The header broke on the shop after yesterday’s change. Roll it back.' },
      { kind: 'tool', tool: 'git_history', args: '{ "path": "components/header.liquid" }', result: '6 changes, 14 commits' },
      { kind: 'agent', text: 'Found it. The last good header.liquid is commit 8fa2c10 from two days ago (14:20), before the header grid change landed.' },
      { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid" @8fa2c10', result: 'diff: 1 grid block' },
      { kind: 'agent', text: 'I can restore just the header, or the whole shop state from that checkpoint. Which do you prefer?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'file',
        label: 'Restore just the header',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '"components/header.liquid" ← 8fa2c10', result: 'restored + push' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"revert: header to 8fa2c10"', result: 'wip → main (7d1e004)' },
          { kind: 'agent', text: 'The header is back to the working version and already live in the shop. I left the rest of yesterday’s changes untouched.' },
        ],
      },
      {
        id: 'all',
        label: 'Revert the whole checkpoint',
        events: [
          { kind: 'tool', tool: 'git_history', args: '{ "restore": "8fa2c10" }', result: '9 files restored' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"revert: full state to 8fa2c10"', result: 'wip → main (5c3a112)' },
          { kind: 'agent', text: 'The whole shop is back to two days ago (8fa2c10) and pushed. Yesterday’s changes are safe in history if you want to cherry-pick individual files.' },
        ],
      },
      {
        id: 'preview',
        label: 'Show me the preview first',
        events: [
          { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid" @8fa2c10', result: 'drops broken grid, restores flex' },
          { kind: 'agent', text: 'Nothing changed yet. Restoring 8fa2c10 removes the new grid block and returns to the flex layout — that was exactly the breaking change. Say the word and I’ll restore it.' },
        ],
      },
    ],
  },

  /* 4 — connect a second shop */
  {
    intro: [
      { kind: 'user', text: 'Add a second shop, "Kawa i Ziarno", and put the same template there as Ogródek.' },
      { kind: 'tool', tool: 'list_shops', args: '{}', result: '1 shop: Ogródek' },
      { kind: 'tool', tool: 'connect_shop', args: '"kawaiziarno.esklep.pl"', result: 'connected ✓' },
      { kind: 'agent', text: 'Connected "Kawa i Ziarno". Ogródek runs Topaz [42] with your edits. How should I bring that over to the new shop?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'copy',
        label: 'Copy the template with my edits',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [42]" → Kawa i Ziarno', result: '128 files uploaded' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"init: Kawa i Ziarno from Topaz [42]"', result: 'new branch (0aa71fd)' },
          { kind: 'agent', text: 'Done. "Kawa i Ziarno" now has the exact same template as Ogródek, including your header edits. The new shop got its own Git branch — the histories stay separate.' },
        ],
      },
      {
        id: 'fresh',
        label: 'Install clean Topaz [42]',
        events: [
          { kind: 'tool', tool: 'select_template', args: '"Topaz [42]" → Kawa i Ziarno (clean)', result: '121 files uploaded' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"init: Kawa i Ziarno (clean Topaz)"', result: 'new branch (4b2c9e0)' },
          { kind: 'agent', text: 'The new shop got a clean Topaz [42], without your Ogródek edits. You can develop it independently from the other one.' },
        ],
      },
      {
        id: 'connect',
        label: 'Just connect it for now',
        events: [
          { kind: 'tool', tool: 'status', args: '"Kawa i Ziarno"', result: 'connected, no template' },
          { kind: 'agent', text: 'The shop is connected and ready, but I haven’t installed a template. Whenever you want, just say so — I’ll copy from Ogródek or install a fresh one.' },
        ],
      },
    ],
  },

  /* 5 — bulk push local changes */
  {
    intro: [
      { kind: 'user', text: 'I have several saved files locally in Ogródek. Push everything to the shop.' },
      { kind: 'tool', tool: 'git_status', args: '{}', result: '6 files changed locally' },
      { kind: 'agent', text: 'I see 6 changes: header.liquid, cart.liquid, 3 CSS files and product.liquid. None conflict with the panel — it hasn’t been touched since your last pull. How should I push?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'checkpoint',
        label: 'Push and make a checkpoint',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'all → push (6 files)', result: 'sent, hot-reload ✓' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"deploy: 6 files to Ogródek"', result: 'wip → main (e6f0a37)' },
          { kind: 'agent', text: 'All 6 files are in the shop and live after hot-reload. I pinned a checkpoint on main, so you have a single point to return to if anything is off.' },
        ],
      },
      {
        id: 'push',
        label: 'Push without a checkpoint',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'all → push (6 files)', result: 'sent, hot-reload ✓' },
          { kind: 'agent', text: 'Sent — 6 files are in the shop. I didn’t make a checkpoint; the changes sit on the wip branch, so if you want them pinned, say so and I’ll close them in a commit.' },
        ],
      },
      {
        id: 'review',
        label: 'Show me the list first',
        events: [
          { kind: 'tool', tool: 'git_status', args: '{ "diff": true }', result: '6 files, +214 −38 lines' },
          { kind: 'agent', text: 'Nothing sent. The biggest changes are in cart.liquid (+120 lines) and header.liquid. Look over the list and tell me which to push — all or a subset.' },
        ],
      },
    ],
  },

  /* 6 — diagnose why sync stopped (logs) */
  {
    intro: [
      { kind: 'user', text: 'I keep saving files but changes aren’t showing up in the Ogródek shop. Find out why.' },
      { kind: 'tool', tool: 'get_logs', args: '{ "level": "error", "limit": 20 }', result: '4× 401 error on upload' },
      { kind: 'tool', tool: 'status', args: '"Ogródek"', result: 'API token expired 40 min ago' },
      { kind: 'agent', text: 'Found it. The shop’s API token expired 40 minutes ago — that’s why every upload comes back 401 and the files stay local. Your changes are safe, just queued. What do we do?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'reconnect',
        label: 'Refresh the connection and finish the upload',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'connect_shop', args: '"Ogródek" → refresh token', result: 'new token ✓' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'queue → push (4 files)', result: 'sent, hot-reload ✓' },
          { kind: 'agent', text: 'I refreshed the token and pushed the 4 queued files — they’re in the shop now. The queue is empty and sync is live again.' },
        ],
      },
      {
        id: 'retry',
        label: 'Just retry the upload',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'queue → push (retry)', result: 'still 401' },
          { kind: 'agent', text: 'The retry didn’t help — still 401, because the token is expired, not a transient network blip. The shop connection needs refreshing; want me to do it?' },
        ],
      },
      {
        id: 'logs',
        label: 'Show the full logs',
        events: [
          { kind: 'tool', tool: 'get_logs', args: '{ "limit": 50 }', result: '4× 401, last OK upload 41 min ago' },
          { kind: 'agent', text: 'The last successful upload was 41 minutes ago, right before the token expired — nothing but 401s after that. This is clearly an expired session, not a file problem. Refreshing the connection fixes it.' },
        ],
      },
    ],
  },

  /* 7 — prune orphaned local files */
  {
    intro: [
      { kind: 'user', text: 'Clean up the Ogródek folder — I have old files that aren’t in the template anymore.' },
      { kind: 'tool', tool: 'status', args: '"Ogródek"', result: '3 orphaned local files' },
      { kind: 'agent', text: 'I found 3 files no longer in the shop’s template: css/old-hero.css, components/banner-2023.liquid and js/legacy-slider.js. Nothing references them. What should I do with them?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'delete',
        label: 'Delete them, checkpoint first',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: '"backup before cleanup"', result: 'wip → main (b3f7d20)' },
          { kind: 'tool', tool: 'status', args: 'remove 3 orphans', result: 'folder cleaned' },
          { kind: 'agent', text: 'Done. The 3 old files are gone from the folder, and I pinned a checkpoint before deleting — if any turns out to be needed, it comes back with one command from history.' },
        ],
      },
      {
        id: 'keep',
        label: 'Leave them',
        events: [
          { kind: 'agent', text: 'Okay, I’ll leave everything as is. Those 3 files stay local; they never reach the shop since the template doesn’t include them, so they break nothing — they just sit in the folder.' },
        ],
      },
      {
        id: 'pull',
        label: 'Sync the folder to the shop',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'sync ← Ogródek', result: 'folder = shop state' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"sync: folder to shop state"', result: 'wip → main (a802c55)' },
          { kind: 'agent', text: 'The local folder now matches the shop template exactly — the 3 orphaned files were removed in the process. All secured with a checkpoint.' },
        ],
      },
    ],
  },

  /* 8 — set up GitHub remote backup */
  {
    intro: [
      { kind: 'user', text: 'I want a backup of Ogródek on GitHub. Set up the remote repo and push the history.' },
      { kind: 'tool', tool: 'git_status', args: '{}', result: 'remote not set, 14 commits' },
      { kind: 'agent', text: 'You have 14 commits locally, but no remote repo is set yet. I can hook up GitHub and push the whole history as a private backup. How should I do it?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'setpush',
        label: 'Attach the repo and push everything',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: 'set remote → github.com/…/ogrodek', result: 'remote set' },
          { kind: 'tool', tool: 'git_history', args: 'push origin main', result: '14 commits pushed ✓' },
          { kind: 'agent', text: 'Done. The private repo is attached and all 14 commits are on GitHub. From now on I can push each checkpoint automatically — you have a full off-machine backup.' },
        ],
      },
      {
        id: 'pushonly',
        label: 'Just push, I already have a remote',
        events: [
          { kind: 'tool', tool: 'git_history', args: 'push origin main', result: '14 commits pushed ✓' },
          { kind: 'agent', text: 'Pushed — 14 commits are on your existing remote. The shop history now has a copy in the cloud.' },
        ],
      },
      {
        id: 'checkpoint',
        label: 'Close pending changes first',
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: '"checkpoint before first push"', result: 'wip → main (d40b17e)' },
          { kind: 'agent', text: 'I closed the pending changes with a checkpoint so the backup really covers everything. Now just say the word and I’ll attach the remote and push all 15 commits.' },
        ],
      },
    ],
  },

  /* 9 — copy template from staging shop to production */
  {
    intro: [
      { kind: 'user', text: 'Move the changes from the test shop "ModaLena-test" to production "ModaLena".' },
      { kind: 'tool', tool: 'list_shops', args: '{}', result: '2 shops: ModaLena, ModaLena-test' },
      { kind: 'tool', tool: 'get_workspace_info', args: 'diff(test → prod)', result: '11 files differ' },
      { kind: 'agent', text: 'Test differs from production in 11 files — mainly a new collection page and cart fixes. Production has no fresh changes of its own, so nothing gets overwritten by accident. How should I move them?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'changed',
        label: 'Move only those 11 changed files',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '11 files: test → ModaLena', result: 'uploaded, hot-reload ✓' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"release: ModaLena-test → prod (11 files)"', result: 'wip → main (f81aa03)' },
          { kind: 'agent', text: 'Shipped. Only those 11 files went to production — the new collection and cart are live. The rest of the production template is untouched, and the release is pinned with a checkpoint.' },
        ],
      },
      {
        id: 'all',
        label: 'Overwrite production with all of test',
        events: [
          { kind: 'tool', tool: 'select_template', args: 'ModaLena-test → ModaLena (full)', result: '124 files overwritten' },
          { kind: 'tool', tool: 'git_checkpoint', args: '"release: full copy test → prod"', result: 'wip → main (30c9b6e)' },
          { kind: 'agent', text: 'Production is now an exact copy of test — all 124 files. The previous production state is in Git history if you ever need to restore a specific file.' },
        ],
      },
      {
        id: 'preview',
        label: 'Show me exactly what changes',
        events: [
          { kind: 'tool', tool: 'preview_conflict', args: 'test → prod (11 files)', result: 'collection.liquid +180, cart.liquid +64' },
          { kind: 'agent', text: 'Nothing shipped. The biggest changes: a new collection.liquid (+180 lines) and cart.liquid (+64). The other 9 are small CSS tweaks. Tell me whether to move all 11 or a subset.' },
        ],
      },
    ],
  },

  /* 10 — deploy a promo before a sale */
  {
    intro: [
      { kind: 'user', text: 'A sale starts in an hour. I have a promo banner and colors ready locally — push them to Ogródek.' },
      { kind: 'tool', tool: 'git_status', args: '{}', result: '3 files: promo-banner.liquid, theme.css, home.liquid' },
      { kind: 'tool', tool: 'preview_conflict', args: '"css/theme.css"', result: 'local newer, no collision' },
      { kind: 'agent', text: 'Ready to publish: the promo banner, red accents in theme.css, and a homepage section. The panel hasn’t been touched, so nothing gets overwritten. How do we ship before the start?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'safe',
        label: 'Back up, then publish',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'git_checkpoint', args: '"backup before the sale"', result: 'wip → main (c05e9a1)' },
          { kind: 'tool', tool: 'resolve_conflict', args: '3 files → push', result: 'promo live, hot-reload ✓' },
          { kind: 'agent', text: 'The promo is live on Ogródek — banner, colors, and the homepage section. I pinned a checkpoint without the promo beforehand, so after the sale you can revert everything with one command.' },
        ],
      },
      {
        id: 'now',
        label: 'Publish immediately',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: '3 files → push', result: 'promo live, hot-reload ✓' },
          { kind: 'agent', text: 'Shipped right away — the promo is already visible in the shop. The changes sit on the wip branch; when the sale ends, tell me and I’ll restore the version without the banner.' },
        ],
      },
      {
        id: 'preview',
        label: 'Preview the banner first',
        events: [
          { kind: 'tool', tool: 'preview_conflict', args: '"components/promo-banner.liquid"', result: '−15% red bar, sticky top' },
          { kind: 'agent', text: 'Not publishing yet. The banner is a red sticky "−15%" bar at the top of the page, with the promo colors in theme.css. It looks consistent — give me the go and I’ll ship the whole thing before the start.' },
        ],
      },
    ],
  },
];

export const SCRIPTS: Record<Lang, Script[]> = { pl: PL, en: EN };

/** Number of scenarios per language (kept in sync across langs). */
export const SCENARIO_COUNT = PL.length;
