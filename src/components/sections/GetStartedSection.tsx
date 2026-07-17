'use client';

import * as React from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useLang } from '@/i18n/LanguageProvider';
import { CopyButton } from './CopyButton';
import { GITHUB_URL } from '../Navbar';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

/* Common first steps — the app ships from source only (no DMG, no npm). */
const INSTALL_COMMANDS = [`git clone ${GITHUB_URL}.git`, 'cd liquid-flow', 'npm install'];

type Tab = 'desktop' | 'cli';

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

  const steps = tab === 'desktop' ? t.getStarted.desktopSteps : t.getStarted.cliSteps;

  return (
    <section id="get-started" className="relative border-t border-white/5 bg-night-950">
      <div ref={contentRef} className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.getStarted.heading}</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">{t.getStarted.subtitle}</p>
        </motion.div>

        {/* Common clone/install steps sit above the toggle, so a user landing on
            either tab always has them in view first. */}
        <motion.div {...fadeUp(0.08)} className="mx-auto mt-12 max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/5 bg-[#10151c] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
              <span className="ml-2 flex-1 truncate font-mono text-xs text-slate-500">liquidflow — zsh</span>
              <CopyButton
                text={INSTALL_COMMANDS.join('\n')}
                copyLabel={t.getStarted.copyLabel}
                copiedLabel={t.getStarted.copiedLabel}
              />
            </div>
            <div className="space-y-1.5 p-4 font-mono text-[13px] leading-relaxed sm:p-5">
              {INSTALL_COMMANDS.map((cmd) => (
                <div key={cmd} className="flex gap-2">
                  <span className="select-none text-ink-muted/60">$</span>
                  <span className="text-ink">{cmd}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink-muted/70">{t.getStarted.requirements}</p>
        </motion.div>

        <motion.div {...fadeUp(0.16)} className="mx-auto mt-12 max-w-2xl">
          <SegmentedToggle
            value={tab}
            onChange={setTab}
            labels={{ desktop: t.getStarted.tabDesktop, cli: t.getStarted.tabCli }}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.ol
              key={tab}
              role="tabpanel"
              id={`get-started-panel-${tab}`}
              aria-labelledby={`get-started-tab-${tab}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="mt-10 space-y-8"
            >
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
                    {'code' in step &&
                      step.code?.map((line) => (
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
            </motion.ol>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
