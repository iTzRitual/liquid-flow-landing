'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Lang } from '@/i18n/dictionaries';

/* A 1:1 replica of the real Ink TUI (apps/cli in the liquid-flow repo): rainbow
 * block-art banner + status header, #82bbff dividers, scrolling log pane, the
 * yellow slash palette and the cyan round-border overlays (conflicts / git).
 * The terminal is persistent within a "session": stages append log lines and
 * type commands into the prompt instead of swapping whole frames. There are two
 * sessions: stage 0 shows a connected app in full swing (the palette tour);
 * stage 1 rewinds to a first launch and stages 1–4 build that session up. */

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

/* — colors (ANSI-ish palette matching the app's Ink colors) — */
const C = {
  title: '#4da3ff', // Liquid Flow CLI title
  divider: '#82bbff', // Divider.jsx
  prompt: '#ff5a1f', // input '›' and git ahead '+N'
  cyan: '#56d4dd',
  magenta: '#c678dd', // sign-in form border (Ink borderColor="magenta")
  green: '#4ade80',
  red: '#f87171',
  yellow: '#e5c07b',
  text: '#cbd5e1',
  dim: '#7d8590',
};

/* — banner: ART + procedural rainbow gradient, ported from banner.js/Banner.jsx — */
const ART = [
  '   ▄████████▄',
  '  ▄███▀▀  ▀▀████▄',
  ' ███▀        ▀███',
  '███            ██',
  '▀██   ▄███▄    █▀',
  ' ▀███████▀',
];

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
}

function hueFor(x: number, y: number, cx: number, cy: number) {
  const dx = x - cx;
  const dy = (y - cy) * 2;
  let a = (Math.atan2(dy, dx) * 180) / Math.PI;
  a = (a + 360) % 360;
  const t = (a - 55 + 360) % 360;
  return (((245 - (t / 360) * 300) % 360) + 360) % 360;
}

const BANNER: { ch: string; color: string | null }[][] = (() => {
  const width = Math.max(...ART.map((l) => l.length));
  const cx = (width - 1) / 2;
  const cy = (ART.length - 1) / 2;
  return ART.map((line, y) =>
    [...line].map((ch, x) => ({
      ch,
      color: ch === ' ' ? null : hslToHex(hueFor(x, y, cx, cy), 95, 60),
    })),
  );
})();

/* — copy pulled verbatim from the app's translations.js — */
function strings(lang: Lang) {
  const pl = lang === 'pl';
  return {
    shopLabel: pl ? 'Sklep:' : 'Shop:',
    templateLabel: pl ? 'Szablon:' : 'Template:',
    gitLabel: 'Git:',
    conflictsIndicator: pl ? '⚠ Konflikty: 2 (/conflicts)' : '⚠ Conflicts: 2 (/conflicts)',
    disconnected: '~',
    placeholder: pl ? 'wpisz / aby zobaczyć komendy · /exit wyjście' : 'type / to see commands · /exit to quit',
    // sign-in form (first launch → add new connection)
    signInTitle: pl ? 'Zaloguj sklep' : 'Sign in to shop',
    fieldName: pl ? 'Nazwa (A-Za-z0-9)' : 'Name (A-Za-z0-9)',
    fieldUrl: 'URL',
    fieldPassword: pl ? 'Hasło webmastera' : 'Webmaster password',
    fieldSave: pl ? 'Zapisz hasło?' : 'Save password?',
    saveYes: pl ? 'Tak' : 'Yes',
    saveNo: pl ? 'Nie' : 'No',
    formNext: pl ? 'Enter dalej' : 'Enter next',
    formCancel: pl ? 'Esc anuluj' : 'Esc cancel',
    // the template every stage lands on (picked in the /templates picker below)
    selectedTemplate: pl ? 'Własny' : 'Custom',
    // connect picker (first run: no saved shops yet, matches the real /connect)
    connectTitle: pl ? 'Połącz ze sklepem' : 'Connect to shop',
    connectAdd: pl ? 'Dodaj nowe połączenie' : 'Add new connection',
    connectImport: pl ? 'Importuj sklepy' : 'Import shops',
    // template picker
    selectTemplate: pl ? 'Wybierz szablon' : 'Select template',
    lockedHint: pl ? '🔒 zablokowany' : '🔒 locked',
    commands: [
      ['/connect', pl ? 'połącz ze sklepem (lista + dodaj nowy)' : 'connect to a shop (list + add new)'],
      ['/templates', pl ? 'wybierz szablon' : 'select template'],
      ['/conflicts', pl ? 'rozwiąż konflikty (pojedynczo + seryjnie)' : 'resolve conflicts (single + bulk)'],
      ['/git', pl ? 'wersjonowanie i backup' : 'versioning and backup'],
      ['/open', pl ? 'otwórz folder lokalny' : 'open local folder'],
      ['/clear', pl ? 'wyczyść panel logu' : 'clear log panel'],
      ['/settings', pl ? 'ustawienia (język, zawijanie logów, nagłówek)' : 'settings (language, log wrapping, header)'],
      ['/exit(quit)', pl ? 'zakończ' : 'quit'],
    ] as [string, string][],
    conflictsTitle: pl ? 'Konflikty plików' : 'File conflicts',
    download: pl ? '↓ Pobierz' : '↓ Download',
    upload: pl ? '↑ Wyślij' : '↑ Upload',
    preview: pl ? 'Podgląd' : 'Preview',
    tsLocal: pl ? 'lokalny' : 'local',
    tsRemote: pl ? 'zdalny' : 'remote',
    localNewer: pl ? 'lokalny nowszy → wyślij' : 'local newer → upload',
    remoteNewer: pl ? 'zdalny nowszy → pobierz' : 'remote newer → download',
    downloadAll: pl ? '↓ Pobierz wszystkie (2)' : '↓ Download all (2)',
    uploadAll: pl ? '↑ Wyślij wszystkie (2)' : '↑ Upload all (2)',
    conflictsHelp: pl
      ? '↑/↓ wybór · ←/→ akcja · Enter zatwierdź · Esc wróć'
      : '↑/↓ select · ←/→ action · Enter confirm · Esc back',
    pickerHelp: pl ? '↑/↓ wybór · Enter zatwierdź · Esc wróć' : '↑/↓ select · Enter confirm · Esc back',
    gitTitle: pl
      ? 'Git / Backup — gałąź liquidflow/wip (14 commit(ów), remote ustawiony)'
      : 'Git / Backup — branch liquidflow/wip (14 commit(s), remote set)',
    gitItems: [
      pl ? 'Zatwierdź wersję (checkpoint)' : 'Checkpoint (commit version)',
      pl ? 'Historia / przywróć wersję' : 'History / restore a version',
      pl ? 'Push do origin' : 'Push to origin',
      pl ? 'Ustaw zdalne repozytorium (remote)' : 'Set remote repository',
    ],
  };
}

// `id` is a stable identity independent of the line's position in whatever
// array it's rendered from — required because the periodic "extra" lines
// slide through a trimmed window (oldest dropped once the buffer is full),
// which shifts every remaining line's ARRAY INDEX. Keying render on that
// index would silently reassign each surviving DOM node to a different
// line's text on every trim (no unmount, so no animation — and no unmount
// mean no fresh entrance either) instead of letting the dropped line unmount
// and the new one mount in cleanly.
type LogLine = { id: string; ts: string; text: string; color: string; kind?: 'separator' };

function liveTs(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

/* File paths cycled through by the periodic "simulated activity" log lines
 * (see the two intervals in Terminal below) — template id 3 ("Własny"/Custom,
 * the one every stage lands on), mode 0, matching the real app's
 * `${templateId}/${mode}/${name}` label format. */
const FAKE_FILES = [
  'common/footer.html',
  'common/header.liquid',
  'css/theme.css',
  'templates/index.liquid',
  'snippets/product-card.liquid',
  'js/cart.js',
  'templates/product.liquid',
  'common/navigation.liquid',
];

function fileChangedLine(lang: Lang, id: string, fileIdx: number): LogLine {
  const pl = lang === 'pl';
  const label = `3/0/${FAKE_FILES[fileIdx % FAKE_FILES.length]}`;
  return { id, ts: liveTs(), text: pl ? `Plik został zmieniony — ${label}` : `File changed — ${label}`, color: C.green };
}

function commitLine(lang: Lang, id: string): LogLine {
  const pl = lang === 'pl';
  const hash = Math.random().toString(16).slice(2, 9);
  return { id, ts: liveTs(), text: pl ? `📝 Git: zapisano wersję ${hash}` : `📝 Git: saved version ${hash}`, color: C.dim };
}

/* Epoch 0 — reopening the app on an existing session (stage 0): a session
 * separator + the four connect-flow log lines the real CLI prints, verbatim
 * from translations.js (NewSession/TemplateSelected/LocalFolderReady/
 * MismatchesChecked/SyncActiveHotReload, all logOk → green). Dated "now" —
 * matches how a just-reopened session actually reads. */
function runningLines(lang: Lang): LogLine[] {
  const pl = lang === 'pl';
  const s = strings(lang);
  const now = new Date();
  const when = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}, ${liveTs()}`;
  const sepText = `── ${pl ? 'Nowa sesja' : 'New session'} • ${when} ` + '─'.repeat(200);
  const ts = liveTs();
  return [
    { id: 'run-sep', ts: '', text: sepText, color: C.divider, kind: 'separator' },
    { id: 'run-0', ts, text: pl ? `Wybrano szablon: ${s.selectedTemplate} [3]` : `Template selected: ${s.selectedTemplate} [3]`, color: C.green },
    { id: 'run-1', ts, text: pl ? 'Folder lokalny gotowy — pliki już pobrane' : 'Local folder ready — files already downloaded', color: C.green },
    { id: 'run-2', ts, text: pl ? 'Sprawdzono niezgodności — konflikty: 0' : 'Mismatches checked — conflicts: 0', color: C.green },
    { id: 'run-3', ts, text: pl ? `Synchronizacja aktywna — hot-reload (${s.selectedTemplate})` : `Synchronization active — hot-reload (${s.selectedTemplate})`, color: C.green },
  ];
}

/* Epoch 1 — the from-zero session that stages 1–4 build up: connect (stage 1),
 * then template + real sync traffic (stage 2) — a file change is one log line
 * (LogFileChanged), and the auto-commit logs as GitVersionSaved, both taken
 * verbatim from translations.js. */
function sessionLines(lang: Lang): LogLine[] {
  const pl = lang === 'pl';
  const s = strings(lang);
  return [
    { id: 'sess-0', ts: '12:00:02', text: pl ? 'Połączono ze sklepem: Ogródek' : 'Connected to shop: Ogródek', color: C.green },
    { id: 'sess-1', ts: '12:00:05', text: pl ? `Wybrano szablon: ${s.selectedTemplate} [3]` : `Template selected: ${s.selectedTemplate} [3]`, color: C.green },
    { id: 'sess-2', ts: '12:00:06', text: pl ? 'Pobrano 128 plików ze sklepu' : 'Downloaded 128 files from shop', color: C.text },
    { id: 'sess-3', ts: '12:04:03', text: pl ? 'Plik został zmieniony — 3/0/common/header.liquid' : 'File changed — 3/0/common/header.liquid', color: C.green },
    { id: 'sess-4', ts: '12:04:09', text: pl ? 'Plik został zmieniony — 3/0/css/layout.css' : 'File changed — 3/0/css/layout.css', color: C.green },
    { id: 'sess-5', ts: '12:04:10', text: pl ? '📝 Git: zapisano wersję a3f21c9' : '📝 Git: saved version a3f21c9', color: C.dim },
  ];
}

const RUNNING_COUNT = 5;
const SESSION_COUNT = 6;

/* — building blocks — */

function Rule({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`shrink-0 select-none overflow-hidden whitespace-pre ${className}`}
      style={{ color: C.divider }}
    >
      {'─'.repeat(240)}
    </div>
  );
}

function Banner() {
  return (
    <div className="shrink-0 whitespace-pre leading-[1.25]" aria-hidden="true">
      {BANNER.map((line, y) => (
        <div key={y}>
          {line.map((c, x) =>
            c.color ? (
              <span key={x} style={{ color: c.color }}>
                {c.ch}
              </span>
            ) : (
              <span key={x}> </span>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function Cursor({ className = '' }: { className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      className={`text-white ${className}`}
    >
      ▍
    </motion.span>
  );
}

/* Header rows appear and disappear as the session progresses, exactly like the
 * real app's StatusBar: disconnected shows only the title + a dim `~`; signing
 * in adds the Shop row; picking a template adds Template + Git; conflicts
 * surface their indicator. Every row is ALWAYS mounted and only fades — the
 * five text rows (not the banner) set the header's height, so a conditionally
 * mounted row would grow the header and shift the divider + log pane below.
 * `initial={false}` keeps snaps (backwards scroll, fast jumps, boot remount)
 * from replaying a fade. */
function HeaderFade({
  show,
  children,
  className = '',
  style,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      aria-hidden={!show}
      className={`overflow-hidden text-ellipsis whitespace-pre ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function Header({
  lang,
  shop,
  template,
  conflicts,
}: {
  lang: Lang;
  shop: boolean;
  template: boolean;
  conflicts: boolean;
}) {
  const s = strings(lang);
  const labelW = Math.max(s.shopLabel.length, s.templateLabel.length, s.gitLabel.length) + 1;
  const pad = (x: string) => x.padEnd(labelW);
  return (
    <div className="flex shrink-0 pl-1 pt-1">
      <Banner />
      <div className="ml-4 flex min-w-0 flex-1 flex-col justify-between whitespace-pre sm:ml-6">
        <div className="overflow-hidden">
          <div className="overflow-hidden text-ellipsis whitespace-pre font-bold" style={{ color: C.title }}>
            Liquid Flow CLI 0.9.179
          </div>
          {/* One grid cell: the dim `~` (disconnected) and the Shop row crossfade
              in the same slot, so the row's height never comes and goes. */}
          <div className="grid">
            <HeaderFade show={!shop} className="col-start-1 row-start-1" style={{ color: C.dim }}>
              {s.disconnected}
            </HeaderFade>
            <HeaderFade show={shop} className="col-start-1 row-start-1">
              <span style={{ color: C.dim }}>{pad(s.shopLabel)}</span>
              <span style={{ color: C.green }}>● Ogródek</span>
              <span style={{ color: C.dim }}>  https://ogrodek.esklep.pl</span>
            </HeaderFade>
          </div>
          <HeaderFade show={template}>
            <span style={{ color: C.dim }}>{pad(s.templateLabel)}</span>
            <span style={{ color: C.cyan }}>{s.selectedTemplate}</span>
            <span style={{ color: C.dim }}> [3]</span>
          </HeaderFade>
          <HeaderFade show={template}>
            <span style={{ color: C.dim }}>{pad(s.gitLabel)}</span>
            <span style={{ color: C.cyan }}>liquidflow/wip</span>
            <span style={{ color: C.prompt }}> +2</span>
            <span style={{ color: C.dim }}> · </span>
            <span style={{ color: C.green }}>commit ✓ </span>
            <span style={{ color: C.green }}>push ✓</span>
          </HeaderFade>
        </div>
        <HeaderFade show={conflicts} className="text-right" style={{ color: C.red }}>
          {s.conflictsIndicator}
        </HeaderFade>
      </div>
    </div>
  );
}

/* The log fills the space above the input/overlay. The lines live in a
 * bottom-anchored absolute container inside an overflow-hidden parent: when the
 * area shrinks (palette/overlay opening) the oldest lines are clipped at the
 * top — like a real terminal — instead of the flex layout squashing them. */
function LogPane({
  lines,
  dim,
  animateFrom,
  animate,
  shift,
}: {
  lines: LogLine[];
  dim: boolean;
  animateFrom: number;
  animate: boolean;
  shift: boolean;
}) {
  return (
    <div
      className={`relative min-h-0 flex-1 overflow-hidden transition-opacity duration-300 ${
        dim ? 'opacity-45' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-x-0 bottom-0 px-1">
      {lines.map((l, i) => (
        <motion.div
          key={l.id}
          // Unified scroll: a new line starts one line-height below its slot
          // (y '100%' — tracks the fractional mobile metrics too) and rides up
          // into place while the existing lines FLIP up via `layout="position"`.
          // y and layout share the SAME timing with NO delay, so the block
          // glides up as one body and the new line emerges from under the
          // pane's clipped bottom edge. Entering lines have no prior layout
          // snapshot, so their layout anim is a no-op — only the y tween moves
          // them; nothing double-applies.
          // `layout` must never toggle per-render: Motion registers projection
          // only at MOUNT, so a line mounted with layout off (under an open
          // overlay) would be excluded from every later FLIP and teleport
          // instead of gliding. When an overlay's height morph owns the
          // vertical movement, the FLIP is suppressed via a zero layout
          // duration instead of dropping the prop.
          layout={animate ? 'position' : undefined}
          initial={i >= animateFrom ? { opacity: 0, y: '100%' } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT, layout: shift ? undefined : { duration: 0 } }}
          className={l.kind === 'separator' ? 'overflow-hidden whitespace-pre' : 'overflow-hidden text-ellipsis whitespace-pre'}
          style={{ color: l.color }}
        >
          {l.kind === 'separator' ? l.text : `${l.ts} ${l.text}`}
        </motion.div>
      ))}
      </div>
    </div>
  );
}

function Palette({ lang }: { lang: Lang }) {
  const s = strings(lang);
  return (
    <div className="whitespace-pre px-1">
      {s.commands.map(([name, desc], i) => {
        const sel = i === 0;
        return (
          <div key={name} className="overflow-hidden text-ellipsis whitespace-pre">
            <span style={sel ? { backgroundColor: C.yellow, color: '#0b0f14' } : { color: C.yellow }}>
              {sel ? '› ' : '  '}
              {name}
            </span>
            <span style={sel ? { backgroundColor: C.yellow, color: '#3f3a28' } : { color: C.dim }}>
              {'   '}
              {desc}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* Cyan round-border overlay frame (Ink `borderStyle="round" borderColor="cyan"`).
 * The animation lives on the height-morphing wrapper in the terminal body, so
 * this is a plain frame — no per-panel entrance to fight the height morph. */
function OverlayFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border px-2 py-1" style={{ borderColor: C.cyan }}>
      <div className="overflow-hidden text-ellipsis whitespace-pre font-bold" style={{ color: C.cyan }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* Sign-in form (Form.jsx: magenta round border). `step` is the index of the
 * active field (4 = complete); `typed` is what has been "typed" into it so far
 * for the two text fields; `choice` is the current Yes/No selection on the
 * Save-password field (a real `type:'choice'` field in the app — ←/→ moves
 * between two boxed options, it does not accept typed text). The stage-1
 * script advances these to auto-fill the form field by field. */
function SignInForm({
  lang,
  step,
  typed,
  choice,
}: {
  lang: Lang;
  step: number;
  typed: string;
  choice: boolean;
}) {
  const s = strings(lang);
  const fields: [string, string][] = [
    [s.fieldName, 'Ogródek'],
    [s.fieldUrl, 'https://ogrodek.esklep.pl'],
    [s.fieldPassword, '••••'],
    [s.fieldSave, s.saveYes],
  ];
  const CHOICE_FIELD = 3;
  // Same hint the whole form through, matching the real app: Save-password
  // is also the last field, and Enter there submits and closes the form
  // immediately (see zeroScript) — there's no lingering moment to read a
  // choice-specific "←/→" hint, so it never appears at all.
  const help = [s.formNext, s.formCancel].join(' · ');
  return (
    <div className="rounded-md border px-2 py-1" style={{ borderColor: C.magenta }}>
      <div className="overflow-hidden text-ellipsis whitespace-pre font-bold" style={{ color: C.magenta }}>
        {s.signInTitle}
      </div>
      {fields.map(([label, value], i) => {
        const done = i < step;
        const activeRow = i === step;
        const isChoiceField = i === CHOICE_FIELD;
        return (
          <div key={label} className="overflow-hidden text-ellipsis whitespace-pre">
            <span style={{ color: activeRow ? C.text : C.dim }}>
              {done ? '✓ ' : activeRow ? '› ' : '  '}
              {label}:{' '}
            </span>
            {activeRow && isChoiceField ? (
              <>
                <span style={choice ? { backgroundColor: C.cyan, color: '#0b0f14' } : { color: C.dim }}>
                  {' '}
                  {s.saveYes}
                  {' '}
                </span>
                <span style={!choice ? { backgroundColor: C.cyan, color: '#0b0f14' } : { color: C.dim }}>
                  {' '}
                  {s.saveNo}
                  {' '}
                </span>
              </>
            ) : (
              <span style={{ color: C.dim }}>{done ? value : activeRow ? typed : '…'}</span>
            )}
            {activeRow && !isChoiceField && <Cursor />}
          </div>
        );
      })}
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {help}
      </div>
    </div>
  );
}

/* First-run connect picker (openConnect in the real commands.js): with no
 * saved shops it offers exactly "add new connection" and "import shops". */
function ConnectPicker({ lang, sel }: { lang: Lang; sel: number }) {
  const s = strings(lang);
  const rows = [s.connectAdd, s.connectImport];
  return (
    <OverlayFrame title={s.connectTitle}>
      {rows.map((label, i) => {
        const isSel = i === sel;
        return (
          <div key={label} className="overflow-hidden text-ellipsis whitespace-pre">
            <span style={isSel ? { backgroundColor: C.cyan, color: '#0b0f14' } : { color: C.text }}>
              {isSel ? '› ' : '  '}
              {label}
            </span>
          </div>
        );
      })}
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {s.pickerHelp}
      </div>
    </OverlayFrame>
  );
}

/* Template picker (Picker.jsx: cyan round border). The shop's four templates
 * — id 3 ("Własny"/Custom) is the one every stage lands on. */
function templatesFor(lang: Lang): { label: string; locked: boolean }[] {
  const pl = lang === 'pl';
  const items: [string, string, number][] = [
    ['Szafir', '2023.5.2', 1],
    ['Rubin', '2026.2.1', 2],
    [pl ? 'Własny' : 'Custom', pl ? 'aktualny 2026' : 'current 2026', 3],
    ['Topaz', '2026.1.1', 4],
  ];
  return items.map(([name, version, id]) => ({ label: `${name} (${version}) [${id}]`, locked: false }));
}

function TemplatePicker({ lang, sel }: { lang: Lang; sel: number }) {
  const s = strings(lang);
  const templates = templatesFor(lang);
  return (
    <OverlayFrame title={s.selectTemplate}>
      {templates.map(({ label, locked }, i) => {
        const isSel = i === sel;
        return (
          <div key={label} className="overflow-hidden text-ellipsis whitespace-pre">
            <span style={isSel ? { backgroundColor: C.cyan, color: '#0b0f14' } : { color: C.text }}>
              {isSel ? '› ' : '  '}
              {label}
            </span>
            {locked && <span style={{ color: isSel ? '#0b0f14' : C.dim }}>{'  '}{s.lockedHint}</span>}
          </div>
        );
      })}
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {s.pickerHelp}
      </div>
    </OverlayFrame>
  );
}

function Btn({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className="whitespace-pre"
      style={active ? { backgroundColor: C.cyan, color: '#0b0f14' } : { color: C.text }}
    >
      {' '}
      {label}{' '}
    </span>
  );
}

function ConflictsOverlay({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const card = (focused: boolean, name: string, meta: string, note: string) => (
    <div className="whitespace-pre">
      <div className="flex justify-between gap-2 overflow-hidden">
        <span className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: focused ? C.cyan : C.text }}>
          {focused ? '› ' : '  '}
          {name}
        </span>
        <span className="hidden shrink-0 sm:inline">
          <Btn label={s.download} />
          <Btn label={s.upload} />
          <Btn label={s.preview} active={focused} />
        </span>
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {'  '}
        {meta}
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {'  '}
        {note}
      </div>
    </div>
  );
  return (
    <OverlayFrame title={s.conflictsTitle}>
      {card(true, 'components/header.liquid', `${s.tsLocal} 07-13 14:32 · ${s.tsRemote} 07-13 12:10`, s.localNewer)}
      <div> </div>
      {card(false, 'css/theme.css', `${s.tsLocal} 07-12 09:15 · ${s.tsRemote} 07-13 13:58`, s.remoteNewer)}
      <div className="overflow-hidden text-ellipsis whitespace-pre">
        <Btn label={s.downloadAll} />
        <Btn label={s.uploadAll} />
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {s.conflictsHelp}
      </div>
    </OverlayFrame>
  );
}

function GitOverlay({ lang }: { lang: Lang }) {
  const s = strings(lang);
  return (
    <OverlayFrame title={s.gitTitle}>
      {s.gitItems.map((label, i) => {
        const sel = i === 0;
        return (
          <div
            key={label}
            className="overflow-hidden text-ellipsis whitespace-pre"
            style={sel ? { backgroundColor: C.cyan, color: '#0b0f14' } : { color: C.text }}
          >
            {sel ? '› ' : '  '}
            {label}
          </div>
        );
      })}
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {s.pickerHelp}
      </div>
    </OverlayFrame>
  );
}

function InputRow({ typed, placeholder }: { typed: string; placeholder: string }) {
  return (
    <div className="overflow-hidden text-ellipsis whitespace-pre pl-1">
      <span style={{ color: C.prompt }}>› </span>
      {typed ? (
        <>
          <span className="text-white">{typed}</span>
          <Cursor />
        </>
      ) : (
        <span className="relative">
          <Cursor className="absolute left-0" />
          <span style={{ color: C.dim }}>{placeholder}</span>
        </span>
      )}
    </div>
  );
}

/* — the state machine — */

const TYPE_MS = 65; // per-character typing speed
const REVEAL_MS = 440; // gap between successive log lines printing in (paced to feel like a live connection, not a dump)

type Overlay = 'none' | 'connect' | 'form' | 'templates' | 'conflicts' | 'git';

type Ui = {
  stage: number;
  mode: 'app' | 'shell'; // 'shell' = bare terminal between app runs (stage 1 relaunch)
  shellTyped: string; // chars typed at the shell prompt
  typed: string; // prompt content
  paletteOpen: boolean;
  overlay: Overlay;
  formStep: number; // active sign-in field (4 = complete)
  formTyped: string; // chars "typed" into the active field
  formChoice: boolean; // Save-password choice field: true = Yes selected
  pickerSel: number; // selected template row
  shop: boolean; // header: Shop row
  template: boolean; // header: Template + Git rows
  conflicts: boolean; // header: conflicts indicator
  epoch: 0 | 1; // which log set (running session vs from-zero session)
  shown: number; // log lines currently printed
  revealFrom: number; // first line index that animates in (earlier ones mount static)
};

/** The resting end-state of each stage — what backwards scrolling and fast
 * jumps snap to, and what scripted entrances finish on. */
function settled(stage: number): Ui {
  const base: Ui = {
    stage,
    mode: 'app',
    shellTyped: '',
    typed: '',
    paletteOpen: false,
    overlay: 'none',
    formStep: 4,
    formTyped: '',
    formChoice: true,
    pickerSel: 0,
    shop: true,
    template: true,
    conflicts: false,
    epoch: 1,
    shown: SESSION_COUNT,
    revealFrom: SESSION_COUNT,
  };
  switch (stage) {
    case 0:
      // Connected app in full swing: palette open over the streamed log.
      return { ...base, typed: '/', paletteOpen: true, epoch: 0, shown: RUNNING_COUNT, revealFrom: RUNNING_COUNT };
    case 1:
      // First-launch session, signed in, template picker open on template 3 (Własny/Custom).
      return { ...base, overlay: 'templates', template: false, shown: 1, revealFrom: 1, pickerSel: 2 };
    case 2:
      return base;
    case 3:
      return { ...base, overlay: 'conflicts', conflicts: true };
    default:
      return { ...base, overlay: 'git', conflicts: true };
  }
}

type Step = [number, Partial<Ui>];

/* Screen-to-screen swap (app ⇄ shell): the leaving screen blurs and slides out
 * in the direction of travel while the next rides in from the opposite side —
 * simultaneously, in the same grid cell, so there is never an empty terminal.
 * Same values as CliSection's tip crossfade (x 64, blur 10, 0.5s ease-out) so
 * the whole stage moves as one body. */
const screenVariants = {
  enter: { x: 64, opacity: 0, filter: 'blur(10px)' },
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { x: -64, opacity: 0, filter: 'blur(10px)' },
};

const typeSteps = (start: number, text: string, ms: number, key: 'typed' | 'formTyped' | 'shellTyped'): Step[] =>
  [...text].map((_, i) => [start + ms * (i + 1), { [key]: text.slice(0, i + 1) } as Partial<Ui>]);

const revealSteps = (start: number, from: number, to: number): Step[] =>
  Array.from({ length: to - from }, (_, k) => [start + REVEAL_MS * k, { shown: from + 1 + k }]);

/** Stage 0 cold boot: the running app streams hot-reload lines, then `/` types
 * itself and the palette slides up from the bottom. Plays once, on scroll into view. */
function introScript(): [Ui, Step[]] {
  const start = { ...settled(0), typed: '', paletteOpen: false, shown: 0, revealFrom: 0 };
  return [start, [...revealSteps(440, 0, RUNNING_COUNT), [2650, { typed: '/' }], [2950, { paletteOpen: true }]]];
}

/** Stage 1 "from zero": the palette closes and the whole terminal clears to a
 * bare shell, `liquidflow` types at the prompt and the app boots fresh
 * (banner + `~`). The first-run connect picker offers "add new connection" /
 * "import shops" (the highlight sweeps over import), then "add new" opens the
 * sign-in pane which auto-fills field by field, and the template picker takes
 * its place. */
function zeroScript(): [Ui, Step[]] {
  // The palette stays open — the whole app screen (palette included) rides out
  // in the screen crossfade while the shell rides in; the exiting frame is a
  // frozen snapshot, so the reset below is invisible until the app re-enters.
  const start = { ...settled(0), stage: 1 };
  const steps: Step[] = [
    [350, {
      mode: 'shell', shellTyped: '', paletteOpen: false, typed: '',
      shop: false, template: false, epoch: 1, shown: 0, revealFrom: 0,
    }],
    ...typeSteps(1000, 'liquidflow', 45, 'shellTyped'),
    // Enter → fresh boot: banner + dim `~`, empty log, cold prompt
    [1900, { mode: 'app' }],
    // first /connect: no saved shops — add new or import; pause on "add new", then Enter
    [2500, { overlay: 'connect', pickerSel: 0 }],
    [4200, { overlay: 'form', formStep: 0, formTyped: '' }],
    ...typeSteps(4750, 'Ogródek', TYPE_MS, 'formTyped'),
    [5450, { formStep: 1, formTyped: '' }],
    ...typeSteps(5550, 'https://ogrodek.esklep.pl', 35, 'formTyped'),
    [6650, { formStep: 2, formTyped: '' }],
    ...typeSteps(6750, '••••', 80, 'formTyped'),
    // Save password?: pause on the default "Yes", then Enter
    [7350, { formStep: 3, formChoice: true }],
    // Save password is the last field — Enter there submits and the form is
    // gone immediately, same as the real app: no "form complete, all fields
    // checked" frame lingers in between (that only makes sense between two
    // fields, where the next one needs to visibly become active).
    [8100, { formStep: 4, overlay: 'templates', shop: true, shown: 1 }],
  ];
  return [start, steps];
}

/** Stage 2: browse the picker top to bottom — template 1, then 2, then 3
 * (Własny/Custom) — "Enter" — the picker collapses, the header gains
 * Template + Git, and the session log prints in. Always starts from template
 * 1 regardless of where `settled(1)`'s resting state leaves the selection. */
function pickScript(): [Ui, Step[]] {
  const start = { ...settled(1), stage: 2, pickerSel: 0 };
  const steps: Step[] = [
    [450, { pickerSel: 1 }],
    [900, { pickerSel: 2 }],
    [1350, { overlay: 'none', template: true }],
    ...revealSteps(1800, 1, SESSION_COUNT),
  ];
  return [start, steps];
}

/** Stages 3/4: type the command into the prompt, then open the overlay. */
function commandScript(stage: 3 | 4): [Ui, Step[]] {
  const cmd = stage === 3 ? '/conflicts' : '/git';
  const start = { ...settled(stage - 1), stage, overlay: 'none' as Overlay, conflicts: stage === 4 };
  const typing = typeSteps(350, cmd, TYPE_MS, 'typed');
  const done = 350 + cmd.length * TYPE_MS + 380;
  const steps: Step[] = [
    ...typing,
    [done, { typed: '', overlay: stage === 3 ? 'conflicts' : 'git', conflicts: true }],
  ];
  return [start, steps];
}

export function Terminal({
  stage,
  lang,
  animate = true,
  active = true,
}: {
  stage: number;
  lang: Lang;
  animate?: boolean;
  active?: boolean;
}) {
  // Stage 0 starts cold (no palette, empty log) so the intro can play into it;
  // reduced motion and every snap target start settled on their end-state.
  const [ui, setUi] = React.useState<Ui>(() =>
    animate && stage === 0 ? { ...settled(0), typed: '', paletteOpen: false, shown: 0, revealFrom: 0 } : settled(stage),
  );
  const prevRef = React.useRef(stage);
  const introDoneRef = React.useRef(false);

  // Simulated activity — kept OUTSIDE `ui` deliberately: `ui` is wholesale
  // replaced on every stage transition (scripted or snapped), which is right
  // for the scripted fields but would wipe this accumulated log history on
  // every move between stages 1–4. Two independent streams, one per epoch/
  // session narrative: `extra0` for stage 0's reconnect, `extra1` for the
  // from-zero session stages 1–4 share. Neither resets on ordinary stage
  // navigation — only `extra1` resets, explicitly, when the from-zero story
  // itself restarts (zeroScript firing again below).
  const [extra0, setExtra0] = React.useState<LogLine[]>([]);
  const [extra1, setExtra1] = React.useState<LogLine[]>([]);
  const extra0IdRef = React.useRef(0);
  const extra1IdRef = React.useRef(0);

  React.useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = stage;

    if (!animate) {
      setUi(settled(stage));
      return;
    }

    const run = ([start, steps]: [Ui, Step[]]) => {
      setUi(start);
      const ids = steps.map(([t, p]) => setTimeout(() => setUi((u) => ({ ...u, ...p })), t));
      return () => ids.forEach(clearTimeout);
    };

    if (stage === 0) {
      // Intro plays once, only after the stage scrolls into view; scrolling on
      // mid-play cancels it (cleanup) and later visits snap to the end-state.
      if (introDoneRef.current) {
        setUi(settled(0));
        return;
      }
      if (!active) {
        setUi({ ...settled(0), typed: '', paletteOpen: false, shown: 0, revealFrom: 0 });
        return;
      }
      introDoneRef.current = true;
      return run(introScript());
    }

    // Backwards or a multi-stage jump → snap; single forward step → script.
    if (stage !== prev + 1) {
      setUi(settled(stage));
      return;
    }
    switch (stage) {
      case 1:
        // A genuine restart of the from-zero story (boot replays) — drop any
        // heartbeat traffic left over from a previous pass through it.
        setExtra1([]);
        return run(zeroScript());
      case 2:
        return run(pickScript());
      default:
        return run(commandScript(stage as 3 | 4));
    }
  }, [stage, active, animate, lang]);

  // Simulated activity heartbeats: once a stage's log has fully printed in,
  // keep appending traffic every couple seconds so the session reads as
  // alive rather than frozen. Gated on `ui.shown` reaching the scripted
  // count, so nothing fires before the stage has actually played in (or
  // before it's even scrolled into view — `shown` stays 0 until then).
  // Cleared immediately on leaving the stage (dependency change) — but the
  // lines already streamed into `extra0` stay put, so browsing away and back
  // finds the log exactly as it was left.
  React.useEffect(() => {
    if (!animate || stage !== 0 || ui.shown < RUNNING_COUNT) return;
    const id = setInterval(() => {
      const n = extra0IdRef.current++;
      setExtra0((prev) => [...prev, fileChangedLine(lang, `e0-${n}`, n)].slice(-20));
    }, 2000);
    return () => clearInterval(id);
  }, [stage, ui.shown, animate, lang]);

  React.useEffect(() => {
    if (!animate || stage !== 2 || ui.shown < SESSION_COUNT) return;
    const id = setInterval(() => {
      const n = extra1IdRef.current++;
      setExtra1((prev) => [...prev, n % 3 === 2 ? commitLine(lang, `e1-${n}`) : fileChangedLine(lang, `e1-${n}`, n)].slice(-20));
    }, 2500);
    return () => clearInterval(id);
  }, [stage, ui.shown, animate, lang]);

  const s = strings(lang);
  const running = React.useMemo(() => runningLines(lang), [lang]);
  const session = React.useMemo(() => sessionLines(lang), [lang]);
  const visibleLines = [
    ...(ui.epoch === 0 ? running : session).slice(0, ui.shown),
    ...(ui.epoch === 0 ? extra0 : extra1),
  ];

  const overlayOpen = ui.overlay !== 'none';

  // The bottom zone (palette/overlay) height-morphs whenever it opens,
  // closes, or swaps to a different panel — during that window its own
  // height change moves the log pane via flex, so per-line FLIP is
  // suppressed to avoid double-animating the same reposition. Once it's
  // settled (the common case — e.g. stage 0's palette sits open for the rest
  // of the stage while heartbeat lines keep streaming underneath it), FLIP is
  // back on so newly appended lines still glide the older ones up smoothly
  // instead of snapping. Tied to the wrapper's own `onAnimationComplete`
  // rather than a guessed timer: a fixed-duration timer races the scripted
  // reveal timeline under rapid back-and-forth navigation (each stage
  // transition restarts both independently), which could leave `shift`
  // toggled off past when the morph actually finished, or on mid-morph —
  // both read as stuck/half-animated lines. Firing off the real animation
  // event instead means it can never drift out of sync with what's
  // actually on screen, however fast the stage changes.
  const [shift, setShift] = React.useState(true);
  React.useEffect(() => {
    setShift(false);
  }, [ui.overlay, ui.paletteOpen]);
  const onBottomZoneSettled = () => setShift(true);

  return (
    /* Below lg the terminal height tracks the viewport (`100svh − stage chrome`)
       so the whole window fits instead of being cropped: the header (banner +
       logo) holds the top, the input/overlay holds the bottom, and the `flex-1`
       LogPane between them compresses toward zero on short viewports. A short
       fixed mask band dissolves just the titlebar/top edge into the background;
       on the very shortest viewports the header's top dips into that fade — its
       logo stays "at least a bit" visible — instead of being cropped away. On
       lg+ the height is fixed (`h-480`) and the frame renders exactly as before. */
    <div className="flex h-[clamp(200px,calc(100svh-372px),496px)] flex-col overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0,#000_44px)] sm:h-[clamp(216px,calc(100svh-300px),520px)] lg:h-auto lg:overflow-visible lg:[mask-image:none]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b0f14] shadow-2xl shadow-black/60 lg:flex-none">
        {/* macOS title bar — hidden below lg (where the frame is cropped into the
            fade): there the app header/logo is the terminal's top edge and
            dissolves straight into the background, with no chrome to overlap it. */}
        <div className="hidden shrink-0 items-center gap-2 border-b border-white/5 bg-[#10151c] px-4 py-3 lg:flex">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
          <span className="ml-3 font-mono text-xs text-slate-500">liquidflow — zsh</span>
        </div>

        {/* No `gap-*` here (or on any ancestor of the bottom zone): a flex gap
            counts mounted children, so during the bottom-zone crossfade the
            exiting element adds an extra 1px gap that vanishes on unmount and
            snaps the bottom-anchored logs 1px down. The 1px rhythm lives on the
            children instead (Rule my-px, pt-px inside each animated wrapper),
            where it collapses together with the exit's height. */}
        <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 pt-1 font-mono text-[11.5px] leading-[1.6] sm:px-3 sm:text-[12.5px] lg:h-[480px] lg:flex-none">
          {/* Both screens share one grid cell so the exiting one (a frozen
              snapshot kept by AnimatePresence) overlaps the entering one.
              NO initial={false} here: that would stamp `initial: false` into
              PresenceContext for the first-mounted screen's whole subtree, and
              every log line / palette / overlay mounted later inside it would
              silently skip its own entrance (lines pop instead of riding up).
              The wrapper's one-time enter plays at page load, far below the
              fold, where nobody sees it. */}
          <div className="grid min-h-0 flex-1">
          <AnimatePresence>
          {ui.mode === 'shell' ? (
            /* Between app runs (stage 1 relaunch): the cleared terminal shows a
               bare shell prompt at the top where `liquidflow` types itself. */
            <motion.div
              key="shell"
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="col-start-1 row-start-1 overflow-hidden text-ellipsis whitespace-pre px-1 pt-1"
            >
              <span style={{ color: C.green }}>~/projects/liquid-sync</span>
              <span style={{ color: C.dim }}> $ </span>
              <span className="text-white">{ui.shellTyped}</span>
              <Cursor />
            </motion.div>
          ) : (
          <motion.div
            key="app"
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="col-start-1 row-start-1 flex min-h-0 flex-col justify-end overflow-hidden"
          >
          <Header lang={lang} shop={ui.shop} template={ui.template} conflicts={ui.conflicts} />
          <Rule className="my-px" />
          {/* Log-line FLIP is suppressed (zero-duration layout via `shift`)
              only for the ~0.5s the bottom zone's own height is actively
              morphing (palette/overlay opening, closing, or swapping) — there
              its height change moves the log pane via flex, and letting the
              lines self-animate too would double up and reintroduce the gap.
              Once settled, FLIP is back on so streamed-in heartbeat lines
              still glide the block up smoothly. The `layout` prop itself
              stays on for every line's whole life (see the mount-registration
              constraint in LogPane). */}
          <LogPane
            lines={visibleLines}
            dim={overlayOpen || ui.paletteOpen}
            animateFrom={animate ? ui.revealFrom : visibleLines.length}
            animate={animate}
            shift={shift}
          />
          {/* One persistent bottom zone. Whatever is current (input row with an
              optional palette, or a form/templates/conflicts/git overlay)
              collapses to/expands from height 0, so the flex-1 log pane is
              pushed and pulled at exactly the panel's rate — logs stay glued to
              its top edge with no gap and no jump. Height-only (no opacity
              fade) — the pane is clipped by overflow-hidden anyway. Each
              wrapper's inner pt-px is the 1px spacing toward the log pane: it
              sits INSIDE the measured auto height, so it grows/collapses with
              the morph instead of living on a container gap that changes with
              the mounted-child count. */}
          <AnimatePresence initial={false} onExitComplete={onBottomZoneSettled}>
            {ui.overlay === 'connect' && (
              <motion.div
                key="connect"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                onAnimationComplete={onBottomZoneSettled}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <ConnectPicker lang={lang} sel={ui.pickerSel} />
                </div>
              </motion.div>
            )}
            {ui.overlay === 'form' && (
              <motion.div
                key="form"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                onAnimationComplete={onBottomZoneSettled}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <SignInForm lang={lang} step={ui.formStep} typed={ui.formTyped} choice={ui.formChoice} />
                </div>
              </motion.div>
            )}
            {ui.overlay === 'templates' && (
              <motion.div
                key="templates"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                onAnimationComplete={onBottomZoneSettled}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <TemplatePicker lang={lang} sel={ui.pickerSel} />
                </div>
              </motion.div>
            )}
            {ui.overlay === 'conflicts' && (
              <motion.div
                key="conflicts"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                onAnimationComplete={onBottomZoneSettled}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <ConflictsOverlay lang={lang} />
                </div>
              </motion.div>
            )}
            {ui.overlay === 'git' && (
              <motion.div
                key="git"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                onAnimationComplete={onBottomZoneSettled}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <GitOverlay lang={lang} />
                </div>
              </motion.div>
            )}
            {!overlayOpen && (
              <motion.div
                key="input"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                onAnimationComplete={onBottomZoneSettled}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <Rule />
                  {/* The slash palette slides up from under the prompt once `/`
                      is typed — its own height morph inside the persistent
                      input wrapper, pushing the (dimmed) log up as it rises. */}
                  <AnimatePresence initial={false} onExitComplete={onBottomZoneSettled}>
                    {ui.paletteOpen && (
                      <motion.div
                        key="palette"
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                        onAnimationComplete={onBottomZoneSettled}
                        className="overflow-hidden"
                      >
                        <Palette lang={lang} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <InputRow typed={ui.typed} placeholder={s.placeholder} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
          )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
