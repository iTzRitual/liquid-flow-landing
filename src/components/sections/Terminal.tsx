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
    placeholder: pl ? 'wpisz / aby zobaczyć komendy · /exit wyjście' : 'type / to see commands · /exit to quit',
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
    { ts: '12:00:01', text: pl ? 'Sesja rozpoczęta' : 'Session started', color: C.dim, stage: 0 },
    { ts: '12:00:02', text: pl ? 'Połączono ze sklepem: Ogródek' : 'Connected to shop: Ogródek', color: C.green, stage: 0 },
    { ts: '12:00:03', text: pl ? 'Wybrano szablon: Topaz [42]' : 'Template selected: Topaz [42]', color: C.text, stage: 0 },
    { ts: '12:00:04', text: pl ? 'Pobrano 128 plików szablonu' : 'Downloaded 128 template files', color: C.text, stage: 0 },
    { ts: '12:04:03', text: pl ? 'Zapisano — components/header.liquid' : 'Saved — components/header.liquid', color: C.text, stage: 1 },
    { ts: '12:04:03', text: pl ? 'Wysyłanie (Liquid_FileSet)…' : 'Uploading (Liquid_FileSet)…', color: C.dim, stage: 1 },
    { ts: '12:04:04', text: pl ? 'Hot-reload — widoczne w sklepie (214 ms)' : 'Hot-reload — live in the shop (214 ms)', color: C.green, stage: 1 },
    { ts: '12:04:09', text: pl ? 'Zapisano — css/layout.css' : 'Saved — css/layout.css', color: C.text, stage: 1 },
    { ts: '12:04:09', text: pl ? 'Hot-reload — widoczne w sklepie (189 ms)' : 'Hot-reload — live in the shop (189 ms)', color: C.green, stage: 1 },
    { ts: '12:04:10', text: 'Auto-commit → liquidflow/wip', color: C.dim, stage: 1 },
  ];
}

/* — building blocks — */

function Rule() {
  return (
    <div aria-hidden="true" className="select-none overflow-hidden whitespace-pre" style={{ color: C.divider }}>
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

function Header({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const labelW = Math.max(s.shopLabel.length, s.templateLabel.length, s.gitLabel.length) + 1;
  const pad = (x: string) => x.padEnd(labelW);
  return (
    <div className="flex pl-1 pt-1">
      <Banner />
      <div className="ml-4 flex min-w-0 flex-1 flex-col justify-between whitespace-pre sm:ml-6">
        <div className="overflow-hidden">
          <div className="overflow-hidden text-ellipsis whitespace-pre font-bold" style={{ color: C.title }}>
            Liquid Flow CLI 0.9.179
          </div>
          <div className="overflow-hidden text-ellipsis whitespace-pre">
            <span style={{ color: C.dim }}>{pad(s.shopLabel)}</span>
            <span style={{ color: C.green }}>● Ogródek</span>
            <span style={{ color: C.dim }}>  https://ogrodek.esklep.pl</span>
          </div>
          <div className="overflow-hidden text-ellipsis whitespace-pre">
            <span style={{ color: C.dim }}>{pad(s.templateLabel)}</span>
            <span style={{ color: C.cyan }}>Topaz</span>
            <span style={{ color: C.dim }}> [42]</span>
          </div>
          <div className="overflow-hidden text-ellipsis whitespace-pre">
            <span style={{ color: C.dim }}>{pad(s.gitLabel)}</span>
            <span style={{ color: C.cyan }}>liquidflow/wip</span>
            <span style={{ color: C.prompt }}> +2</span>
            <span style={{ color: C.dim }}> · </span>
            <span style={{ color: C.green }}>commit ✓ </span>
            <span style={{ color: C.green }}>push ✓</span>
          </div>
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-pre text-right" style={{ color: C.red }}>
          {s.conflictsIndicator}
        </div>
      </div>
    </div>
  );
}

/* The log fills the space above the input/overlay. The lines live in a
 * bottom-anchored absolute container inside an overflow-hidden parent: when the
 * area shrinks (palette/overlay opening) the oldest lines are clipped at the
 * top — like a real terminal — instead of the flex layout squashing them. */
function LogPane({ lines, dim, animateFrom }: { lines: LogLine[]; dim: boolean; animateFrom: number }) {
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
          initial={i >= animateFrom ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i >= animateFrom ? (i - animateFrom) * 0.28 : 0 }}
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

/* Cyan round-border overlay frame (Ink `borderStyle="round" borderColor="cyan"`). */
function OverlayFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="rounded-md border px-2 py-1"
      style={{ borderColor: C.cyan }}
    >
      <div className="overflow-hidden text-ellipsis whitespace-pre font-bold" style={{ color: C.cyan }}>
        {title}
      </div>
      {children}
    </motion.div>
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

type Ui = { stage: number; typed: string; settled: boolean };

/** Command typed into the prompt to reach `stage` (empty = nothing typed). */
const stageCmd = (stage: number) => (stage === 2 ? '/conflicts' : stage === 3 ? '/git' : '');

export function Terminal({ stage, lang, animate = true }: { stage: number; lang: Lang; animate?: boolean }) {
  const [ui, setUi] = React.useState<Ui>({ stage, typed: stage === 0 ? '/' : '', settled: true });
  const prevRef = React.useRef(stage);

  React.useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = stage;
    const cmd = stageCmd(stage);
    // Backwards, reduced motion, or a stage without a command → settle instantly.
    if (!animate || stage <= prev || !cmd) {
      setUi({ stage, typed: stage === 0 ? '/' : '', settled: true });
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
  }, [stage, animate]);

  const s = strings(lang);
  const lines = React.useMemo(() => logLines(lang), [lang]);
  const visibleLines = lines.filter((l) => l.stage <= ui.stage);
  // Stage-1 lines fade in one by one when freshly reached (scrolling forward).
  const animateFrom = animate && ui.stage >= 1 ? lines.filter((l) => l.stage === 0).length : visibleLines.length;
  const overlayOpen = ui.settled && ui.stage >= 2;
  const paletteOpen = ui.stage === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0f14] shadow-2xl shadow-black/60">
      {/* macOS title bar */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#10151c] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-slate-500">liquidflow — zsh</span>
      </div>

      <div className="flex h-[440px] flex-col gap-px px-2 pb-2 pt-1 font-mono text-[11.5px] leading-[1.6] sm:h-[480px] sm:px-3 sm:text-[12.5px]">
        <Header lang={lang} />
        <Rule />
        <LogPane lines={visibleLines} dim={overlayOpen} animateFrom={animateFrom} />
        <AnimatePresence mode="wait" initial={false}>
          {overlayOpen && ui.stage === 2 && <ConflictsOverlay key="conflicts" lang={lang} />}
          {overlayOpen && ui.stage === 3 && <GitOverlay key="git" lang={lang} />}
        </AnimatePresence>
        {!overlayOpen && (
          <>
            <Rule />
            {paletteOpen && <Palette lang={lang} />}
            <InputRow typed={ui.typed || (paletteOpen ? '/' : '')} placeholder={s.placeholder} />
          </>
        )}
      </div>
    </div>
  );
}
