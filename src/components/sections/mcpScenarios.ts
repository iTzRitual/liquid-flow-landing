import type { Lang } from '@/i18n/dictionaries';

/* ————— Scripted agent workflows for the MCP chat demo —————
 *
 * Each scenario is a self-contained conversation: a scripted `intro` that ends
 * at a `{ kind: 'decision' }` point, then three `choices` that each append their
 * own follow-up events. One choice per scenario is flagged `recommended` (the
 * auto-decide fallback). Every tool name and command matches the real Liquid Flow
 * MCP server (list_conflicts, preview_conflict, resolve_conflict, list_templates,
 * select_template, get_workspace_info, get_logs, status), so the transcript only
 * shows what the agent can genuinely do. The section picks one scenario at random. */

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
  /* 1 — resolve conflicts */
  {
    intro: [
      { kind: 'user', text: 'Sprawdź konflikty w sklepie Ogródek i pomóż mi je rozwiązać.' },
      { kind: 'tool', tool: 'list_conflicts', args: '{}', result: '2 konflikty' },
      { kind: 'agent', text: 'Masz 2 konflikty między plikami lokalnymi a panelem. Podejrzę, co dokładnie się różni…' },
      { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid"', result: 'lokalny nowszy o 2 h' },
      { kind: 'tool', tool: 'preview_conflict', args: '"css/theme.css"', result: 'zmieniony w panelu 20 min temu' },
      {
        kind: 'agent',
        text:
          'header.liquid — Twoja lokalna wersja jest nowsza: przebudowany nagłówek i dodane menu mobilne.\n' +
          'theme.css — zmieniony w panelu: ktoś poprawił kolory przycisków w promocji.\n\n' +
          'Którą wersję zostawić po której stronie?',
      },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'mixed',
        label: 'Nagłówek mój, motyw ze sklepu',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'upload "components/header.liquid"', result: 'wysłano do sklepu' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'download "css/theme.css"', result: 'pobrano z panelu' },
          { kind: 'agent', text: 'Gotowe. Nagłówek z menu mobilnym jest w sklepie, a kolory przycisków z panelu pobrałem do Ciebie. Oba konflikty rozwiązane — sync znów czysty.' },
        ],
      },
      {
        id: 'local',
        label: 'Zostaw obie moje wersje',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'upload "components/header.liquid"', result: 'wysłano do sklepu' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'upload "css/theme.css"', result: 'wysłano do sklepu' },
          { kind: 'agent', text: 'Zrobione — obie Twoje wersje są w sklepie. Uwaga: zmiana kolorów z panelu została nadpisana; gdyby była potrzebna, odtworzę ją z podglądu, który zdążyłem pobrać.' },
        ],
      },
      {
        id: 'remote',
        label: 'Pobierz obie ze sklepu',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'download "components/header.liquid"', result: 'pobrano z panelu' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'download "css/theme.css"', result: 'pobrano z panelu' },
          { kind: 'agent', text: 'Pobrane — folder lokalny odpowiada teraz sklepowi. Twoja wersja nagłówka została zastąpiona wersją z panelu; gdybyś chciał ją wrócić, powiedz, zanim znów zsynchronizujemy.' },
        ],
      },
    ],
  },

  /* 2 — migrate a template: bring what's new in a fresh Topaz into a custom build */
  {
    intro: [
      { kind: 'user', text: 'Mam swój szablon z 2023 (na bazie Topaza) i wgrałem obok czysty Topaz 2026.3. Pomóż przenieść nowości do mojego.' },
      { kind: 'tool', tool: 'list_templates', args: '{}', result: '2 szablony: Mój 2023 · Topaz 2026.3' },
      { kind: 'agent', text: 'Widzę oba. Pobiorę każdy lokalnie, żeby je zestawić — najpierw świeży Topaz 2026.3, potem wracam na Twój.' },
      { kind: 'tool', tool: 'select_template', args: 'Topaz 2026.3', result: 'pobrano 121 plików' },
      { kind: 'tool', tool: 'select_template', args: 'Mój 2023', result: 'pobrano 118 plików' },
      { kind: 'agent', text: 'Zestawiłem oba szablony. Topaz 2026.3 dodaje koszyk krokowy, sekcję opinii i poprawki dostępności. Twoje customy — nagłówek i filtry kolekcji — są tylko u Ciebie. Od czego zaczynamy?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'plan-migrate',
        label: 'Pokaż plan i przenieś',
        recommended: true,
        events: [
          { kind: 'agent', text: 'Plan: 1) koszyk krokowy, 2) sekcja opinii, 3) poprawki dostępności — nagłówek i filtry kolekcji zostawiam bez zmian. Wykonuję po kolei…' },
          { kind: 'tool', tool: 'get_logs', args: '{}', result: '9 plików wysłanych · hot-reload ✓' },
          { kind: 'agent', text: 'Gotowe. Wszystkie trzy nowości z 2026.3 są już w Twoim szablonie i w sklepie; Twoje customy nietknięte. Przejrzyj i daj znać, czy dorzucić coś jeszcze.' },
        ],
      },
      {
        id: 'plan',
        label: 'Najpierw tylko plan',
        events: [
          { kind: 'agent', text: 'Nic nie ruszam. Plan migracji: 1) przenieść koszyk krokowy, 2) dołożyć sekcję opinii, 3) wnieść poprawki dostępności — nagłówek i filtry bez zmian. Powiedz, które kroki wykonać.' },
        ],
      },
      {
        id: 'fetch',
        label: 'Na razie tylko pobierz oba',
        events: [
          { kind: 'agent', text: 'Oba szablony masz już lokalnie, obok siebie. Nic nie zmieniam — kiedy zechcesz zobaczyć różnice albo zacząć migrację, wystarczy powiedzieć.' },
        ],
      },
    ],
  },

  /* 3 — edit shop content live via the workspace + hot-reload */
  {
    intro: [
      { kind: 'user', text: 'W sklepie Ogródek dodaj na górze strony pasek „Darmowa dostawa od 200 zł”.' },
      { kind: 'tool', tool: 'status', args: '{}', result: 'Ogródek · Topaz · sync aktywny' },
      { kind: 'tool', tool: 'get_workspace_info', args: '{}', result: 'folder edycji gotowy' },
      { kind: 'agent', text: 'Ogródek jest połączony, szablon Topaz aktywny. Pasek dodam w components/header.liquid, a jego styl w css/theme.css — w wersji na desktop i mobile. Wgrywam?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'add',
        label: 'Dodaj pasek',
        recommended: true,
        events: [
          { kind: 'agent', text: 'Dodaję sticky pasek na górze i dopasowuję odstęp nagłówka…' },
          { kind: 'tool', tool: 'get_logs', args: '{}', result: 'header.liquid, theme.css · hot-reload ✓' },
          { kind: 'agent', text: 'Gotowe — pasek „Darmowa dostawa od 200 zł” jest na żywo na górze strony, na desktopie i mobile. Zapisane pliki sklep podłapał od razu.' },
        ],
      },
      {
        id: 'preview',
        label: 'Najpierw pokaż, co dodasz',
        events: [
          { kind: 'agent', text: 'Nic jeszcze nie wgrywam. W header.liquid dodałbym sticky pasek: tło z akcentu motywu, wyśrodkowany tekst „Darmowa dostawa od 200 zł”. W theme.css jeden nowy kolor i odstęp pod nagłówek. Daj sygnał, a wgrywam.' },
        ],
      },
      {
        id: 'link',
        label: 'Dodaj i podlinkuj do koszyka',
        events: [
          { kind: 'agent', text: 'Dodaję pasek i podpinam go pod stronę koszyka…' },
          { kind: 'tool', tool: 'get_logs', args: '{}', result: 'header.liquid, theme.css · hot-reload ✓' },
          { kind: 'agent', text: 'Gotowe — pasek jest na żywo i klika się do koszyka. Wszystko wgrane, sklep odświeżył się automatycznie.' },
        ],
      },
    ],
  },
];

/* ————— EN ————— */

const EN: Script[] = [
  /* 1 — resolve conflicts */
  {
    intro: [
      { kind: 'user', text: 'Check the Ogródek shop for conflicts and help me resolve them.' },
      { kind: 'tool', tool: 'list_conflicts', args: '{}', result: '2 conflicts' },
      { kind: 'agent', text: 'You have 2 conflicts between your local files and the panel. Let me preview what exactly differs…' },
      { kind: 'tool', tool: 'preview_conflict', args: '"components/header.liquid"', result: 'local newer by 2 h' },
      { kind: 'tool', tool: 'preview_conflict', args: '"css/theme.css"', result: 'changed in panel 20 min ago' },
      {
        kind: 'agent',
        text:
          'header.liquid — your local version is newer: rebuilt header plus a new mobile menu.\n' +
          'theme.css — changed in the panel: someone tweaked button colors for a promo.\n\n' +
          'Which version should I keep on each side?',
      },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'mixed',
        label: 'My header, theme from shop',
        recommended: true,
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'upload "components/header.liquid"', result: 'uploaded to shop' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'download "css/theme.css"', result: 'pulled from panel' },
          { kind: 'agent', text: 'Done. The header with the mobile menu is live in the shop, and I pulled the panel’s button colors down to you. Both conflicts resolved — sync is clean again.' },
        ],
      },
      {
        id: 'local',
        label: 'Keep both of mine',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'upload "components/header.liquid"', result: 'uploaded to shop' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'upload "css/theme.css"', result: 'uploaded to shop' },
          { kind: 'agent', text: 'Done — both of your versions are in the shop. Note: the panel’s color change was overwritten; if you need it, I can restore it from the preview I already captured.' },
        ],
      },
      {
        id: 'remote',
        label: 'Pull both from shop',
        events: [
          { kind: 'tool', tool: 'resolve_conflict', args: 'download "components/header.liquid"', result: 'pulled from panel' },
          { kind: 'tool', tool: 'resolve_conflict', args: 'download "css/theme.css"', result: 'pulled from panel' },
          { kind: 'agent', text: 'Pulled — your local folder now matches the shop. Your header version was replaced by the panel’s; if you want it back, tell me before we sync again.' },
        ],
      },
    ],
  },

  /* 2 — migrate a template: bring what's new in a fresh Topaz into a custom build */
  {
    intro: [
      { kind: 'user', text: 'I have my own 2023 template (built on Topaz) and I added a clean Topaz 2026.3 next to it. Help me bring the new bits into mine.' },
      { kind: 'tool', tool: 'list_templates', args: '{}', result: '2 templates: My 2023 · Topaz 2026.3' },
      { kind: 'agent', text: 'I see both. I’ll download each one locally to compare them — the fresh Topaz 2026.3 first, then back to yours.' },
      { kind: 'tool', tool: 'select_template', args: 'Topaz 2026.3', result: '121 files downloaded' },
      { kind: 'tool', tool: 'select_template', args: 'My 2023', result: '118 files downloaded' },
      { kind: 'agent', text: 'I compared both templates. Topaz 2026.3 adds a step-by-step cart, a reviews section and accessibility fixes. Your customizations — the header and collection filters — exist only in yours. Where do we start?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'plan-migrate',
        label: 'Show the plan, then migrate',
        recommended: true,
        events: [
          { kind: 'agent', text: 'Plan: 1) the step-by-step cart, 2) the reviews section, 3) the accessibility fixes — leaving your header and collection filters untouched. Running them now…' },
          { kind: 'tool', tool: 'get_logs', args: '{}', result: '9 files uploaded · hot-reload ✓' },
          { kind: 'agent', text: 'Done. All three additions from 2026.3 are in your template and live in the shop; your customizations are untouched. Take a look and tell me if you want more.' },
        ],
      },
      {
        id: 'plan',
        label: 'Just the plan first',
        events: [
          { kind: 'agent', text: 'Touching nothing. Migration plan: 1) bring over the step-by-step cart, 2) add the reviews section, 3) apply the accessibility fixes — header and filters untouched. Tell me which steps to run.' },
        ],
      },
      {
        id: 'fetch',
        label: 'Just download both for now',
        events: [
          { kind: 'agent', text: 'Both templates are on your machine now, side by side. I’m changing nothing — whenever you want to see the diff or start the migration, just say so.' },
        ],
      },
    ],
  },

  /* 3 — edit shop content live via the workspace + hot-reload */
  {
    intro: [
      { kind: 'user', text: 'In the Ogródek shop, add a “Free shipping over 200 zł” bar at the top of the page.' },
      { kind: 'tool', tool: 'status', args: '{}', result: 'Ogródek · Topaz · sync active' },
      { kind: 'tool', tool: 'get_workspace_info', args: '{}', result: 'edit folder ready' },
      { kind: 'agent', text: 'Ogródek is connected and the Topaz template is active. I’ll add the bar in components/header.liquid and its style in css/theme.css — desktop and mobile. Shall I ship it?' },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'add',
        label: 'Add the bar',
        recommended: true,
        events: [
          { kind: 'agent', text: 'Adding a sticky bar at the top and adjusting the header spacing…' },
          { kind: 'tool', tool: 'get_logs', args: '{}', result: 'header.liquid, theme.css · hot-reload ✓' },
          { kind: 'agent', text: 'Done — the “Free shipping over 200 zł” bar is live at the top of the page, on desktop and mobile. The shop picked up the saved files right away.' },
        ],
      },
      {
        id: 'preview',
        label: 'Show me what you’ll add first',
        events: [
          { kind: 'agent', text: 'Not shipping anything yet. In header.liquid I’d add a sticky bar: background from the theme accent, centered “Free shipping over 200 zł” text. In theme.css, one new color and some spacing under the header. Give me the go and I’ll ship it.' },
        ],
      },
      {
        id: 'link',
        label: 'Add it and link to the cart',
        events: [
          { kind: 'agent', text: 'Adding the bar and linking it to the cart page…' },
          { kind: 'tool', tool: 'get_logs', args: '{}', result: 'header.liquid, theme.css · hot-reload ✓' },
          { kind: 'agent', text: 'Done — the bar is live and clicks through to the cart. Everything’s uploaded and the shop refreshed automatically.' },
        ],
      },
    ],
  },
];

export const SCRIPTS: Record<Lang, Script[]> = { pl: PL, en: EN };

/** Number of scenarios per language (kept in sync across langs). */
export const SCENARIO_COUNT = PL.length;
