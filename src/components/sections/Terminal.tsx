'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Lang } from '@/i18n/dictionaries';

/* A dark macOS terminal window with a scripted liquidflow TUI. Frames mirror
 * the real Ink interface: status bar → live log → prompt with slash palette. */

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

type Line = { text: string; className?: string };

function statusBar(conflicts: number, lang: Lang): Line {
  const c = conflicts === 0 ? (lang === 'pl' ? 'brak konfliktów' : 'no conflicts') : `${conflicts} ${lang === 'pl' ? 'konflikty' : 'conflicts'}`;
  return {
    text: ` Ogródek · Topaz (ID 42) · ${c} · git: wip `,
    className: 'bg-[#1c2333] text-[#82bbff]',
  };
}

const DIM = 'text-slate-500';
const OK = 'text-[#4ade80]';
const INFO = 'text-[#82bbff]';
const WARN = 'text-[#fbbf24]';
const CMD = 'text-[#c792ea]';

export function terminalFrames(lang: Lang): Line[][] {
  const pl = lang === 'pl';
  return [
    // Frame 0 — /connect: the slash palette
    [
      statusBar(2, lang),
      { text: '' },
      { text: `12:00:01  ${pl ? 'Sesja rozpoczęta' : 'Session started'}`, className: DIM },
      { text: `12:00:02  ${pl ? 'Połączono ze sklepem Ogródek' : 'Connected to shop Ogródek'}`, className: OK },
      { text: `12:00:03  ${pl ? 'Pobrano 128 plików szablonu' : 'Downloaded 128 template files'}` },
      { text: '' },
      { text: '❯ /', className: 'text-white' },
      { text: '  ┌──────────────────────────────────────────┐', className: DIM },
      { text: `  │ /connect    ${pl ? 'połącz ze sklepem' : 'connect to a shop'}`.padEnd(46) + '│', className: CMD },
      { text: `  │ /templates  ${pl ? 'wybierz szablon' : 'pick a template'}`.padEnd(46) + '│', className: DIM },
      { text: `  │ /conflicts  ${pl ? 'konflikty i akcje' : 'conflicts & actions'}`.padEnd(46) + '│', className: DIM },
      { text: `  │ /git        ${pl ? 'wersjonowanie i backup' : 'versioning & backup'}`.padEnd(46) + '│', className: DIM },
      { text: '  └──────────────────────────────────────────┘', className: DIM },
    ],
    // Frame 1 — hot-reload log streaming
    [
      statusBar(2, lang),
      { text: '' },
      { text: `12:04:03  ${pl ? 'Zapisano — components/header.liquid' : 'Saved — components/header.liquid'}` },
      { text: `12:04:03  ${pl ? 'Wysyłanie (Liquid_FileSet)…' : 'Uploading (Liquid_FileSet)…'}`, className: INFO },
      { text: `12:04:04  ${pl ? 'Hot-reload — widoczne w sklepie (214 ms)' : 'Hot-reload — live in the shop (214 ms)'}`, className: OK },
      { text: `12:04:09  ${pl ? 'Zapisano — css/layout.css' : 'Saved — css/layout.css'}` },
      { text: `12:04:09  ${pl ? 'Hot-reload — widoczne w sklepie (189 ms)' : 'Hot-reload — live in the shop (189 ms)'}`, className: OK },
      { text: `12:04:10  Auto-commit → liquidflow/wip`, className: INFO },
      { text: '' },
      { text: `❯ ${pl ? 'obserwuję zmiany…' : 'watching for changes…'}`, className: DIM },
    ],
    // Frame 2 — /conflicts
    [
      statusBar(2, lang),
      { text: '' },
      { text: '❯ /conflicts', className: 'text-white' },
      { text: '' },
      { text: `  ${pl ? 'Wykryte konflikty' : 'Detected conflicts'}:`, className: WARN },
      { text: `  ● components/header.liquid   ${pl ? 'lokalny nowszy' : 'local newer'}`, className: OK },
      { text: `  ● css/theme.css              ${pl ? 'zmieniony w panelu' : 'changed in panel'}`, className: WARN },
      { text: '' },
      { text: `  [p] ${pl ? 'pobierz' : 'pull'}   [n] ${pl ? 'nadpisz' : 'overwrite'}   [a] ${pl ? 'wszystkie' : 'all'}   [esc] ${pl ? 'wróć' : 'back'}`, className: DIM },
    ],
    // Frame 3 — /git
    [
      statusBar(0, lang),
      { text: '' },
      { text: '❯ /git', className: 'text-white' },
      { text: '' },
      { text: '  liquidflow/wip ──● auto-commit', className: INFO },
      { text: '  main ──────────● checkpoint ─→ push origin', className: OK },
      { text: '' },
      { text: `  a1b2c3d  feat: ${pl ? 'nowy układ nagłówka' : 'new header layout'}       2026-07-12`, className: DIM },
      { text: `  e4f5g6h  fix: ${pl ? 'przycinanie długich nazw' : 'truncate long names'}      2026-07-10`, className: DIM },
      { text: '' },
      { text: `  [c] checkpoint   [p] push   [h] ${pl ? 'historia' : 'history'}   [esc] ${pl ? 'wróć' : 'back'}`, className: DIM },
    ],
  ];
}

export function Terminal({ frame, lang }: { frame: number; lang: Lang }) {
  const reduceMotion = useReducedMotion();
  const frames = terminalFrames(lang);
  const lines = frames[Math.min(frame, frames.length - 1)];

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0f19] shadow-2xl shadow-black/60">
      {/* macOS title bar */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#111624] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-slate-500">liquidflow — zsh</span>
      </div>

      <div className="relative h-[360px] p-4 font-mono text-[12.5px] leading-[1.7] sm:h-[400px] sm:text-[13px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={frame}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="absolute inset-4 overflow-hidden"
          >
            {lines.map((line, i) => (
              <div key={i} className={`whitespace-pre ${line.className ?? 'text-slate-300'}`}>
                {line.text || ' '}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
