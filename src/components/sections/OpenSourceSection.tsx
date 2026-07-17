'use client';

import * as React from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { Bug, Check, Copy, Sparkles, Star } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import { GITHUB_URL } from '../Navbar';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

/* Real install steps — the tool ships from source, not from npm. */
const COMMANDS = [`git clone ${GITHUB_URL}.git`, 'cd liquid-flow', 'npm install', 'npm run cli'];

const CARDS = [
  { href: `${GITHUB_URL}/issues`, icon: Bug },
  { href: `${GITHUB_URL}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`, icon: Sparkles },
  { href: GITHUB_URL, icon: Star },
] as const;

function CopyButton({ copyLabel, copiedLabel }: { copyLabel: string; copiedLabel: string }) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(COMMANDS.join('\n'));
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable or denied — leave the button in its normal state.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors hover:border-white/25 hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="flex items-center gap-1.5 text-feedback-success"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {copiedLabel}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {copyLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function OpenSourceSection() {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(contentRef, { once: true, amount: 0.15 });

  const fadeUp = (delay: number) => {
    const hidden = { opacity: 0, y: 16, filter: 'blur(8px)' } as const;
    const visible = { opacity: 1, y: 0, filter: 'blur(0px)' } as const;
    return {
      initial: reduceMotion ? false : hidden,
      animate: reduceMotion || inView ? visible : hidden,
      transition: { duration: 0.5, delay, ease: EASE_OUT },
    };
  };

  return (
    <section id="open-source" className="relative border-t border-white/5 bg-night-950">
      <div ref={contentRef} className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.openSource.heading}</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">{t.openSource.subtitle}</p>
        </motion.div>

        <motion.div {...fadeUp(0.08)} className="mx-auto mt-12 max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/5 bg-[#10151c] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
              <span className="ml-2 flex-1 truncate font-mono text-xs text-slate-500">liquidflow — zsh</span>
              <CopyButton copyLabel={t.openSource.copyLabel} copiedLabel={t.openSource.copiedLabel} />
            </div>
            <div className="space-y-1.5 p-4 font-mono text-[13px] leading-relaxed sm:p-5">
              {COMMANDS.map((cmd) => (
                <div key={cmd} className="flex gap-2">
                  <span className="select-none text-ink-muted/60">$</span>
                  <span className="text-ink">{cmd}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink-muted/70">{t.openSource.nodeNote}</p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {t.openSource.cards.map((card, i) => {
            const { href, icon: Icon } = CARDS[i];
            return (
              <motion.a
                key={card.title}
                {...fadeUp(0.16 + i * 0.06)}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-night-900 p-6 transition-colors hover:border-white/20 hover:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-muted transition-colors group-hover:text-ink">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-medium text-ink">{card.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{card.description}</p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
