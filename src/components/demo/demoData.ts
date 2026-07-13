import type { Lang } from '@/i18n/dictionaries';

/* Fixtures for the embedded app demo. Shapes mirror the design-system props
 * (SidebarShop, FileTreeNode, ActivityLogEntry) so the vendored components
 * render exactly as in the real application. */

export const demoShops = [
  { Id: 'demo-1', Name: 'Ogródek', Url: 'https://ogrodek.comarch.pl/sklep' },
  { Id: 'demo-2', Name: 'Topaz Testowy', Url: 'https://topaz.example.com' },
];

export const demoFileTree = [
  {
    name: 'components',
    children: [
      { name: 'mobile', children: [{ name: 'mobile1.min.css' }, { name: 'main.js' }] },
      { name: 'header.liquid' },
      { name: 'footer.liquid' },
    ],
  },
  { name: 'css', children: [{ name: 'layout.css' }, { name: 'theme.css' }] },
  { name: 'snippets', children: [{ name: 'product-card.liquid' }] },
  { name: 'settings.liquid' },
  { name: 'index.html' },
];

export type DemoTone = 'success' | 'info' | 'warning' | 'error' | 'neutral';

export interface DemoLogEntry {
  id: number;
  time: string;
  tone: DemoTone;
  message: string;
  muted?: boolean;
}

/* The looping hot-reload story played in the Aktywność tab. */
export const logScript: Record<Lang, { tone: DemoTone; message: string }[]> = {
  pl: [
    { tone: 'neutral', message: 'Zapisano — components/header.liquid' },
    { tone: 'info', message: 'Wysyłanie do sklepu (Liquid_FileSet)…' },
    { tone: 'success', message: 'Hot-reload — zmiana widoczna w sklepie (214 ms)' },
    { tone: 'info', message: 'Auto-commit na liquidflow/wip' },
    { tone: 'neutral', message: 'Zapisano — css/layout.css' },
    { tone: 'success', message: 'Hot-reload — zmiana widoczna w sklepie (189 ms)' },
  ],
  en: [
    { tone: 'neutral', message: 'Saved — components/header.liquid' },
    { tone: 'info', message: 'Uploading to shop (Liquid_FileSet)…' },
    { tone: 'success', message: 'Hot-reload — change live in the shop (214 ms)' },
    { tone: 'info', message: 'Auto-commit on liquidflow/wip' },
    { tone: 'neutral', message: 'Saved — css/layout.css' },
    { tone: 'success', message: 'Hot-reload — change live in the shop (189 ms)' },
  ],
};

export const initialLog: Record<Lang, DemoLogEntry[]> = {
  pl: [
    { id: 4, time: '12:03:12', tone: 'warning', message: 'Wykryto 2 konflikty z panelem administracyjnym' },
    { id: 3, time: '12:00:03', tone: 'success', message: 'Pobrano 128 plików szablonu', muted: true },
    { id: 2, time: '12:00:02', tone: 'info', message: 'Połączono ze sklepem Ogródek', muted: true },
    { id: 1, time: '12:00:01', tone: 'neutral', message: 'Sesja rozpoczęta', muted: true },
  ],
  en: [
    { id: 4, time: '12:03:12', tone: 'warning', message: '2 conflicts detected with the admin panel' },
    { id: 3, time: '12:00:03', tone: 'success', message: 'Downloaded 128 template files', muted: true },
    { id: 2, time: '12:00:02', tone: 'info', message: 'Connected to shop Ogródek', muted: true },
    { id: 1, time: '12:00:01', tone: 'neutral', message: 'Session started', muted: true },
  ],
};

export type ConflictKind = 'local' | 'remote' | 'localMissing';

export interface DemoConflict {
  id: string;
  file: string;
  kind: ConflictKind;
}

export const initialConflicts: DemoConflict[] = [
  { id: 'c1', file: 'components/header.liquid', kind: 'local' },
  { id: 'c2', file: 'css/theme.css', kind: 'remote' },
];

export interface DemoCommit {
  hash: string;
  subject: string;
  date: string;
}

export const initialHistory: Record<Lang, DemoCommit[]> = {
  pl: [
    { hash: 'a1b2c3d', subject: 'feat: nowy układ nagłówka', date: '2026-07-12' },
    { hash: 'e4f5g6h', subject: 'fix: przycinanie długich nazw produktów', date: '2026-07-10' },
    { hash: 'i7j8k9l', subject: 'checkpoint: wersja przed promocją', date: '2026-07-08' },
  ],
  en: [
    { hash: 'a1b2c3d', subject: 'feat: new header layout', date: '2026-07-12' },
    { hash: 'e4f5g6h', subject: 'fix: truncate long product names', date: '2026-07-10' },
    { hash: 'i7j8k9l', subject: 'checkpoint: pre-promo version', date: '2026-07-08' },
  ],
};

export const resolvedLogMessage: Record<Lang, (file: string) => string> = {
  pl: (file) => `Rozwiązano konflikt — ${file}`,
  en: (file) => `Conflict resolved — ${file}`,
};

export const checkpointLogMessage: Record<Lang, string> = {
  pl: 'Checkpoint — squash liquidflow/wip → main',
  en: 'Checkpoint — squash liquidflow/wip → main',
};

export const checkpointCommit: Record<Lang, string> = {
  pl: 'checkpoint: zmiany z sesji na żywo',
  en: 'checkpoint: live session changes',
};
