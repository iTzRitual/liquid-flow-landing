'use client';

import * as React from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ChevronDown, Download } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import { CopyButton } from './CopyButton';
import { GITHUB_URL } from '../Navbar';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

const RELEASES_URL = `${GITHUB_URL}/releases/latest`;

type Tab = 'desktop' | 'cli';

type Step = { title: string; body: string; code?: readonly string[] };

type Os = 'mac' | 'windows' | 'linux';

/* userAgent only (not userAgentData.platform): it is what UA-spoofing tests can
 * override, and the order matters — 'Windows NT' before the generic 'Linux'
 * that Android UAs also carry. Anything unrecognized (including Android, which
 * has no build) falls back to macOS, the site's primary identity. */
function detectOs(): Os {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Android/i.test(ua)) return 'mac';
  if (/Linux|X11/i.test(ua)) return 'linux';
  return 'mac';
}

/** Renders `code` spans for backtick-wrapped fragments in dictionary copy. */
function InlineCode({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
            {part}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

function SegmentedToggle({
  value,
  onChange,
  labels,
}: {
  value: Tab;
  onChange: (tab: Tab) => void;
  labels: { desktop: string; cli: string };
}) {
  const reduceMotion = useReducedMotion();
  const tabs: { id: Tab; label: string }[] = [
    { id: 'desktop', label: labels.desktop },
    { id: 'cli', label: labels.cli },
  ];
  return (
    <div
      role="tablist"
      className="relative mx-auto grid w-full max-w-xs grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1"
    >
      {/* Plain animated x — not a `layout` FLIP — so the indicator can never be
          silently excluded from projection by a layout prop toggling per-render. */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/10"
        initial={false}
        animate={{ x: value === 'desktop' ? '0%' : '100%' }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`get-started-tab-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={`get-started-panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === tab.id ? 'text-ink' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* Split button: primary pill labeled for the visitor's OS + an attached
 * chevron opening a menu with all three platforms. The server and first client
 * paint always render the macOS default; the detected OS is applied after
 * mount so the prerendered page never hydration-mismatches. */
function DownloadMenu() {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const [os, setOs] = React.useState<Os>('mac');
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setOs(detectOs());
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative mt-4 inline-flex">
      <a
        href={RELEASES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-l-full bg-ink py-2 pl-4 pr-3 text-sm font-medium text-night-950 transition-colors hover:bg-white"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {t.getStarted.download[os]}
      </a>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.getStarted.downloadOther}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center rounded-r-full border-l border-night-950/20 bg-ink py-2 pl-2 pr-2.5 text-night-950 transition-colors hover:bg-white"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t.getStarted.downloadOther}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            style={{ transformOrigin: 'top left' }}
            className="absolute left-0 top-full z-10 mt-2 w-56 rounded-xl border border-white/10 bg-night-900 p-1.5 shadow-2xl shadow-black/60"
          >
            {t.getStarted.platforms.map((platform) => (
              <a
                key={platform.name}
                role="menuitem"
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-white/5 focus:bg-white/5 focus:outline-none"
              >
                {platform.name}
                <span className="font-mono text-xs text-ink-muted">{platform.hint}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommandSnippet({ line, copyLabel, copiedLabel }: { line: string; copyLabel: string; copiedLabel: string }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0b0f14] px-3.5 py-2.5 font-mono text-[13px]">
      <span className="min-w-0 truncate">
        <span className="select-none text-ink-muted/60">$ </span>
        <span className="text-ink">{line}</span>
      </span>
      <CopyButton text={line} copyLabel={copyLabel} copiedLabel={copiedLabel} />
    </div>
  );
}

export function GetStartedSection() {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(contentRef, { once: true, amount: 0.15 });
  const [tab, setTab] = React.useState<Tab>('desktop');

  const fadeUp = (delay: number) => {
    const hidden = { opacity: 0, y: 16, filter: 'blur(8px)' } as const;
    const visible = { opacity: 1, y: 0, filter: 'blur(0px)' } as const;
    return {
      initial: reduceMotion ? false : hidden,
      animate: reduceMotion || inView ? visible : hidden,
      transition: { duration: 0.5, delay, ease: EASE_OUT },
    };
  };

  const steps: readonly Step[] = tab === 'desktop' ? t.getStarted.desktopSteps : t.getStarted.cliSteps;

  return (
    <section id="get-started" className="relative border-t border-white/5 bg-night-950">
      <div ref={contentRef} className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.getStarted.heading}</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">{t.getStarted.subtitle}</p>
        </motion.div>

        <motion.div {...fadeUp(0.08)} className="mx-auto mt-12 max-w-2xl">
          <SegmentedToggle
            value={tab}
            onChange={setTab}
            labels={{ desktop: t.getStarted.tabDesktop, cli: t.getStarted.tabCli }}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              role="tabpanel"
              id={`get-started-panel-${tab}`}
              aria-labelledby={`get-started-tab-${tab}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="mt-10"
            >
              <ol className="space-y-8">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full border border-white/10 font-mono text-xs text-ink-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-ink">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                        <InlineCode text={step.body} />
                      </p>
                      {/* A download is not a terminal action — the packaged app
                          gets a split button; only the CLI keeps the terminal. */}
                      {tab === 'desktop' && i === 0 && <DownloadMenu />}
                      {step.code?.map((line) => (
                        <CommandSnippet
                          key={line}
                          line={line}
                          copyLabel={t.getStarted.copyLabel}
                          copiedLabel={t.getStarted.copiedLabel}
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
              {/* Node/Git only matter for the npm-installed CLI — the packaged
                  desktop app bundles its runtime. */}
              {tab === 'cli' && (
                <p className="mt-8 text-center text-xs text-ink-muted/70">{t.getStarted.requirements}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
