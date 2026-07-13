'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Bot, Check, Terminal as TerminalIcon, User } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const STEP_DELAY_MS = 900;

interface ToolCall {
  tool: string;
  args: string;
  result: { pl: string; en: string };
}

const TOOL_CALLS: ToolCall[] = [
  {
    tool: 'connect_shop',
    args: '{ "shop": "Ogródek" }',
    result: { pl: 'Połączono (sesja SOAP aktywna)', en: 'Connected (SOAP session active)' },
  },
  {
    tool: 'get_mismatches',
    args: '{}',
    result: {
      pl: '2 konflikty: header.liquid (lokalny nowszy), theme.css (lokalny nowszy)',
      en: '2 conflicts: header.liquid (local newer), theme.css (local newer)',
    },
  },
  {
    tool: 'resolve_conflict',
    args: '{ "file": "components/header.liquid", "action": "push" }',
    result: { pl: 'Nadpisano wersję w sklepie', en: 'Shop version overwritten' },
  },
  {
    tool: 'resolve_conflict',
    args: '{ "file": "css/theme.css", "action": "push" }',
    result: { pl: 'Nadpisano wersję w sklepie', en: 'Shop version overwritten' },
  },
  {
    tool: 'git_checkpoint',
    args: '{ "message": "resolve conflicts after header redesign" }',
    result: { pl: 'Squash wip → main (f3d9a21)', en: 'Squashed wip → main (f3d9a21)' },
  },
];

/* user msg → each tool call → final answer */
const TOTAL_STEPS = 1 + TOOL_CALLS.length + 1;

function Reveal({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (!visible) return null;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

export function McpSection() {
  const { lang, t } = useLang();
  const reduceMotion = useReducedMotion();
  const chatRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(chatRef, { once: true, amount: 0.35 });
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setStep(TOTAL_STEPS);
      return;
    }
    const id = window.setInterval(() => {
      setStep((prev) => {
        if (prev >= TOTAL_STEPS) {
          window.clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_DELAY_MS);
    return () => window.clearInterval(id);
  }, [inView, reduceMotion]);

  return (
    <section id="mcp" className="relative border-t border-white/5 bg-night-950">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">{t.mcp.heading}</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">{t.mcp.subtitle}</p>
        </div>

        <div
          ref={chatRef}
          className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-night-900 p-4 shadow-2xl shadow-black/40 sm:p-6"
        >
          {/* User message */}
          <Reveal visible={step >= 1}>
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                <User className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
              </span>
              <p className="rounded-xl rounded-tl-sm bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-slate-200">
                {t.mcp.userMessage}
              </p>
            </div>
          </Reveal>

          {/* Agent tool calls */}
          <div className="mb-4 flex flex-col gap-2 pl-10">
            {TOOL_CALLS.map((call, i) => {
              const revealed = step >= 2 + i;
              const done = step >= 3 + i;
              return (
                <Reveal key={i} visible={revealed}>
                  <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-night-850 px-3 py-2 font-mono text-xs">
                    {done ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-feedback-success" aria-hidden="true" />
                    ) : (
                      <TerminalIcon className="h-3.5 w-3.5 shrink-0 animate-pulse text-brand-soft" aria-hidden="true" />
                    )}
                    <span className="text-brand-soft">{call.tool}</span>
                    <span className="hidden truncate text-slate-500 sm:inline">{call.args}</span>
                    {done && <span className="ml-auto hidden shrink-0 text-slate-400 md:inline">{call.result[lang]}</span>}
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Final assistant message */}
          <Reveal visible={step >= TOTAL_STEPS}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20">
                <Bot className="h-3.5 w-3.5 text-brand-soft" aria-hidden="true" />
              </span>
              <p className="rounded-xl rounded-tl-sm border border-brand/20 bg-brand/10 px-4 py-2.5 text-sm leading-relaxed text-slate-200">
                {t.mcp.final}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
