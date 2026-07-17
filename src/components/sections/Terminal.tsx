'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Lang } from '@/i18n/dictionaries';

/* A 1:1 replica of the real Ink TUI (apps/cli in the liquid-flow repo): rainbow
 * block-art banner + status header, #82bbff dividers, scrolling log pane, the
 * yellow slash palette and the cyan round-border overlays (conflicts / git).
 * The terminal is persistent — stages append log lines and type commands into
 * the prompt instead of swapping whole frames. */

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
    // sign-in form (/connect → add new connection)
    signInTitle: pl ? 'Zaloguj sklep' : 'Sign in to shop',
    fieldName: pl ? 'Nazwa (A-Za-z0-9)' : 'Name (A-Za-z0-9)',
    fieldUrl: 'URL',
    fieldPassword: pl ? 'Hasło webmastera' : 'Webmaster password',
    fieldSave: pl ? 'Zapisz hasło?' : 'Save password?',
    formHelp: pl ? 'Enter dalej · Esc anuluj' : 'Enter next · Esc cancel',
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

type LogLine = { ts: string; text: string; color: string; stage: number };

function logLines(lang: Lang): LogLine[] {
  const pl = lang === 'pl';
  return [
    // stage 1: signed in (header gains the Shop row)
    { ts: '12:00:02', text: pl ? 'Połączono ze sklepem: Ogródek' : 'Connected to shop: Ogródek', color: C.green, stage: 1 },
    // stage 2: template selected → files pulled → hot-reload editing
    { ts: '12:00:05', text: pl ? 'Wybrano szablon: Topaz [42]' : 'Template selected: Topaz [42]', color: C.green, stage: 2 },
    { ts: '12:00:06', text: pl ? 'Pobrano 128 plików ze sklepu' : 'Downloaded 128 files from shop', color: C.text, stage: 2 },
    { ts: '12:04:03', text: pl ? 'Zapisano — components/header.liquid' : 'Saved — components/header.liquid', color: C.text, stage: 2 },
    { ts: '12:04:03', text: pl ? 'Wysyłanie (Liquid_FileSet)…' : 'Uploading (Liquid_FileSet)…', color: C.dim, stage: 2 },
    { ts: '12:04:04', text: pl ? 'Hot-reload — widoczne w sklepie (214 ms)' : 'Hot-reload — live in the shop (214 ms)', color: C.green, stage: 2 },
    { ts: '12:04:09', text: pl ? 'Zapisano — css/layout.css' : 'Saved — css/layout.css', color: C.text, stage: 2 },
    { ts: '12:04:09', text: pl ? 'Hot-reload — widoczne w sklepie (189 ms)' : 'Hot-reload — live in the shop (189 ms)', color: C.green, stage: 2 },
    { ts: '12:04:10', text: 'Auto-commit → liquidflow/wip', color: C.dim, stage: 2 },
  ];
}

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

/* Header rows appear as the session progresses, exactly like the real app's
 * StatusBar: disconnected shows only the title + a dim `~`; /connect adds the
 * Shop row (stage ≥ 1); picking a template adds Template + Git (stage ≥ 2);
 * conflicts surface their indicator (stage ≥ 3). The banner's 6 rows fix the
 * header height, so rows filling in never shift the log pane below. */
function HeaderRow({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="overflow-hidden text-ellipsis whitespace-pre"
    >
      {children}
    </motion.div>
  );
}

function Header({ lang, stage }: { lang: Lang; stage: number }) {
  const s = strings(lang);
  const labelW = Math.max(s.shopLabel.length, s.templateLabel.length, s.gitLabel.length) + 1;
  const pad = (x: string) => x.padEnd(labelW);
  const hasShop = stage >= 1;
  const hasTemplate = stage >= 2;
  const hasConflicts = stage >= 3;
  return (
    <div className="flex shrink-0 pl-1 pt-1">
      <Banner />
      <div className="ml-4 flex min-w-0 flex-1 flex-col justify-between whitespace-pre sm:ml-6">
        <div className="overflow-hidden">
          <div className="overflow-hidden text-ellipsis whitespace-pre font-bold" style={{ color: C.title }}>
            Liquid Flow CLI 0.9.179
          </div>
          {hasShop ? (
            <HeaderRow>
              <span style={{ color: C.dim }}>{pad(s.shopLabel)}</span>
              <span style={{ color: C.green }}>● Ogródek</span>
              <span style={{ color: C.dim }}>  https://ogrodek.esklep.pl</span>
            </HeaderRow>
          ) : (
            <div className="whitespace-pre" style={{ color: C.dim }}>{s.disconnected}</div>
          )}
          {hasTemplate && (
            <HeaderRow>
              <span style={{ color: C.dim }}>{pad(s.templateLabel)}</span>
              <span style={{ color: C.cyan }}>Topaz</span>
              <span style={{ color: C.dim }}> [42]</span>
            </HeaderRow>
          )}
          {hasTemplate && (
            <HeaderRow>
              <span style={{ color: C.dim }}>{pad(s.gitLabel)}</span>
              <span style={{ color: C.cyan }}>liquidflow/wip</span>
              <span style={{ color: C.prompt }}> +2</span>
              <span style={{ color: C.dim }}> · </span>
              <span style={{ color: C.green }}>commit ✓ </span>
              <span style={{ color: C.green }}>push ✓</span>
            </HeaderRow>
          )}
        </div>
        {hasConflicts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden text-ellipsis whitespace-pre text-right"
            style={{ color: C.red }}
          >
            {s.conflictsIndicator}
          </motion.div>
        )}
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
          key={i}
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
          className="overflow-hidden text-ellipsis whitespace-pre"
          style={{ color: l.color }}
        >
          {l.ts} {l.text}
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

/* Sign-in form (Form.jsx: magenta round border). Shown mid-fill — name + URL
 * already entered (✓), webmaster password being typed (›), save-password pending. */
function SignInForm({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const label = (mark: string, text: string, dim: boolean) => (
    <span style={{ color: dim ? C.dim : C.text }}>
      {mark}
      {text}:{' '}
    </span>
  );
  return (
    <div className="rounded-md border px-2 py-1" style={{ borderColor: C.magenta }}>
      <div className="overflow-hidden text-ellipsis whitespace-pre font-bold" style={{ color: C.magenta }}>
        {s.signInTitle}
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre">
        {label('✓ ', s.fieldName, true)}
        <span style={{ color: C.dim }}>Ogródek</span>
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre">
        {label('✓ ', s.fieldUrl, true)}
        <span style={{ color: C.dim }}>https://ogrodek.esklep.pl</span>
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre">
        {label('› ', s.fieldPassword, false)}
        <span style={{ color: C.dim }}>••••</span>
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          className="text-white"
        >
          ▍
        </motion.span>
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre">
        {label('  ', s.fieldSave, true)}
        <span style={{ color: C.dim }}>…</span>
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-pre" style={{ color: C.dim }}>
        {s.formHelp}
      </div>
    </div>
  );
}

/* Template picker (Picker.jsx: cyan round border), first row selected. */
function TemplatePicker({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const row = (sel: boolean, name: string, hint?: string) => (
    <div className="overflow-hidden text-ellipsis whitespace-pre">
      <span style={sel ? { backgroundColor: C.cyan, color: '#0b0f14' } : { color: C.text }}>
        {sel ? '› ' : '  '}
        {name}
      </span>
      {hint && <span style={{ color: sel ? '#0b0f14' : C.dim }}>{'  '}{hint}</span>}
    </div>
  );
  return (
    <OverlayFrame title={s.selectTemplate}>
      {row(true, 'Topaz [42]')}
      {row(false, 'Szafir [39]')}
      {row(false, 'Bursztyn [17]', s.lockedHint)}
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
        <span className="text-white">{typed}</span>
      ) : (
        <span style={{ color: C.dim }}>{placeholder}</span>
      )}
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        className="text-white"
      >
        ▍
      </motion.span>
    </div>
  );
}

/* — the terminal window — */

const TYPE_MS = 65; // per-character typing speed
const OPEN_DELAY_MS = 380; // pause between Enter and the overlay opening
const REVEAL_MS = 440; // gap between successive log lines printing in (paced to feel like a live connection, not a dump)
const INTRO_START_MS = 620; // beat on the cold prompt before `/connect` types itself
const CONNECT_CMD = '/connect';

type Ui = { stage: number; typed: string; settled: boolean };

/** Which overlay is a stage's settled bottom zone (null → the plain input row). */
type OverlayKind = 'form' | 'templates' | 'conflicts' | 'git';
const overlayKindFor = (stage: number): OverlayKind | null =>
  stage === 0 ? 'form' : stage === 1 ? 'templates' : stage === 3 ? 'conflicts' : stage === 4 ? 'git' : null;

/** Command typed into the prompt on the way into a stage (empty = nothing typed). */
const stageCmd = (stage: number) => (stage === 3 ? '/conflicts' : stage === 4 ? '/git' : '');

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
  // Stage 0 starts cold (unsettled → bare input) so the intro can type into it;
  // every other stage (and reduced motion) starts settled on its end-state.
  const [ui, setUi] = React.useState<Ui>({ stage, typed: '', settled: !(animate && stage === 0) });
  const prevRef = React.useRef(stage);
  const introDoneRef = React.useRef(false);

  React.useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = stage;

    // Stage 0 cold-boot intro: launch → `/` opens the palette → `/connect` types
    // itself → the sign-in form opens. Plays once, only after the stage scrolls
    // into view; if the user scrolls on mid-type, the stage change cancels it.
    if (animate && stage === 0) {
      if (!active || introDoneRef.current) {
        setUi({ stage: 0, typed: '', settled: introDoneRef.current });
        return;
      }
      introDoneRef.current = true;
      setUi({ stage: 0, typed: '', settled: false });
      let i = 0;
      let typer: ReturnType<typeof setInterval> | undefined;
      let opener: ReturnType<typeof setTimeout> | undefined;
      const starter = setTimeout(() => {
        typer = setInterval(() => {
          i += 1;
          setUi((u) => ({ ...u, typed: CONNECT_CMD.slice(0, i) }));
          if (i >= CONNECT_CMD.length) {
            clearInterval(typer);
            opener = setTimeout(() => setUi({ stage: 0, typed: '', settled: true }), OPEN_DELAY_MS);
          }
        }, TYPE_MS);
      }, INTRO_START_MS);
      return () => {
        clearTimeout(starter);
        if (typer) clearInterval(typer);
        if (opener) clearTimeout(opener);
      };
    }

    const cmd = stageCmd(stage);
    // Backwards, reduced motion, or a stage without a command → settle instantly.
    if (!animate || stage <= prev || !cmd) {
      setUi({ stage, typed: '', settled: true });
      return;
    }
    // Forward into /conflicts or /git: type the command, then open the overlay —
    // the terminal appends like the real app instead of swapping frames.
    setUi({ stage, typed: '', settled: false });
    let i = 0;
    let opener: ReturnType<typeof setTimeout> | undefined;
    const typer = setInterval(() => {
      i += 1;
      setUi((u) => ({ ...u, typed: cmd.slice(0, i) }));
      if (i >= cmd.length) {
        clearInterval(typer);
        opener = setTimeout(() => setUi((u) => ({ ...u, typed: '', settled: true })), OPEN_DELAY_MS);
      }
    }, TYPE_MS);
    return () => {
      clearInterval(typer);
      if (opener) clearTimeout(opener);
    };
  }, [stage, active, animate]);

  const s = strings(lang);
  const lines = React.useMemo(() => logLines(lang), [lang]);

  // How many log lines are currently printed. Newly-reached stages don't dump
  // their lines at once — they print one at a time (see effect below), so each
  // appended row pushes the log up by one row via the layout animation, instead
  // of snapping to the final height and filling empty space afterwards.
  const [shown, setShown] = React.useState(() => lines.filter((l) => l.stage <= stage).length);
  const shownRef = React.useRef(shown);
  React.useEffect(() => {
    const target = lines.filter((l) => l.stage <= ui.stage).length;
    // Backwards, reduced motion, or no new lines → snap to the target count.
    if (!animate || target <= shownRef.current) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    // Forward with new lines: print them one by one, REVEAL_MS apart.
    const id = setInterval(() => {
      shownRef.current += 1;
      setShown(shownRef.current);
      if (shownRef.current >= target) clearInterval(id);
    }, REVEAL_MS);
    return () => clearInterval(id);
  }, [ui.stage, animate, lines]);

  const visibleLines = lines.slice(0, shown);
  // Every revealed line fades in as it prints (no pre-connected backlog exists).
  const animateFrom = animate ? 0 : visibleLines.length;
  const overlayKind = overlayKindFor(ui.stage);
  const overlayOpen = ui.settled && overlayKind !== null;
  // The slash palette only shows once `/` has been typed during the cold-start
  // intro; before that it's a bare prompt, and every settled stage shows its
  // overlay or the plain input row.
  const paletteOpen = ui.stage === 0 && !ui.settled && ui.typed.startsWith('/');

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
        <div className="flex min-h-0 flex-1 flex-col justify-end px-2 pb-2 pt-1 font-mono text-[11.5px] leading-[1.6] sm:px-3 sm:text-[12.5px] lg:h-[480px] lg:flex-none">
          <Header lang={lang} stage={ui.stage} />
          <Rule className="my-px" />
          {/* Log-line FLIP is suppressed (zero-duration layout via `shift`)
              whenever an overlay is open: there the bottom zone's height morph
              owns all vertical movement and the logs ride it via flex. Letting
              the lines self-animate too would double up and reintroduce the
              gap. The `layout` prop itself stays on for every line's whole
              life (see the mount-registration constraint in LogPane); the FLIP
              runs at the input stage (the hot-reload lines printing), which
              the height morph doesn't cover. */}
          <LogPane
            lines={visibleLines}
            dim={overlayOpen}
            animateFrom={animateFrom}
            animate={animate}
            shift={!overlayOpen}
          />
          {/* One persistent bottom zone. Whatever is current (input row, or a
              conflicts/git overlay) collapses to/expands from height 0, so the
              flex-1 log pane is pushed and pulled at exactly the panel's rate —
              logs stay glued to its top edge with no gap and no jump.
              Height-only (no opacity fade) — the pane is clipped by
              overflow-hidden anyway. Each wrapper's inner pt-px is the 1px
              spacing toward the log pane: it sits INSIDE the measured auto
              height, so it grows/collapses with the morph instead of living on
              a container gap that changes with the mounted-child count. */}
          <AnimatePresence initial={false}>
            {overlayOpen && overlayKind === 'form' && (
              <motion.div
                key="form"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <SignInForm lang={lang} />
                </div>
              </motion.div>
            )}
            {overlayOpen && overlayKind === 'templates' && (
              <motion.div
                key="templates"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <TemplatePicker lang={lang} />
                </div>
              </motion.div>
            )}
            {overlayOpen && overlayKind === 'conflicts' && (
              <motion.div
                key="conflicts"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <ConflictsOverlay lang={lang} />
                </div>
              </motion.div>
            )}
            {overlayOpen && overlayKind === 'git' && (
              <motion.div
                key="git"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
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
                className="shrink-0 overflow-hidden"
              >
                <div className="pt-px">
                  <Rule />
                  {paletteOpen && <Palette lang={lang} />}
                  <InputRow typed={ui.typed || (paletteOpen ? '/' : '')} placeholder={s.placeholder} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
