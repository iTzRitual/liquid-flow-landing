'use client';

import * as React from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUp, Bot, Check, Loader2, Paperclip } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import { SCENARIO_COUNT, SCRIPTS, type ChatEvent, type Choice } from './mcpScenarios';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const STEP_DELAY_MS = 1300;
const AUTO_DECIDE_MS = 6500;

/* ————— Rendering ————— */

function Message({ event, done }: { event: ChatEvent; done: boolean }) {
  const reduceMotion = useReducedMotion();
  const base = {
    initial: reduceMotion ? false : ({ opacity: 0, y: 10 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: EASE_OUT },
  };

  if (event.kind === 'user') {
    return (
      <motion.div {...base} className="flex flex-row-reverse items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/user-avatar.jpeg"
          alt=""
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-white/10 object-cover"
        />
        <p className="rounded-xl rounded-tr-sm bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-ink">
          {event.text}
        </p>
      </motion.div>
    );
  }

  if (event.kind === 'agent') {
    return (
      <motion.div {...base} className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Bot className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
        </span>
        <p className="whitespace-pre-line rounded-xl rounded-tl-sm border border-white/10 px-4 py-2.5 text-sm leading-relaxed text-ink">
          {event.text}
        </p>
      </motion.div>
    );
  }

  if (event.kind === 'tool') {
    return (
      <motion.div {...base} className="pl-10">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-xs">
          {done ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-feedback-success" aria-hidden="true" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-ink-muted" aria-hidden="true" />
          )}
          <span className="shrink-0 text-ink">{event.tool}</span>
          <span className="truncate text-ink-muted/70">{event.args}</span>
          {done && <span className="ml-auto hidden shrink-0 text-ink-muted sm:inline">{event.result}</span>}
        </div>
      </motion.div>
    );
  }

  return null;
}

export function McpSection() {
  const { lang, t } = useLang();
  const reduceMotion = useReducedMotion();

  // A random scenario plays on each visit. Start at 0 (server and first client
  // render agree — no hydration mismatch), then pick a random one on mount.
  const [scenario, setScenario] = React.useState(0);
  const [played, setPlayed] = React.useState<number[]>([]);
  React.useEffect(() => {
    const first = Math.floor(Math.random() * SCENARIO_COUNT);
    setScenario(first);
    setPlayed([first]);
  }, []);
  const script = SCRIPTS[lang][scenario];

  const chatRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(chatRef, { once: true, amount: 0.4 });

  /** Full event list currently playing: intro, then the chosen branch. */
  const [events, setEvents] = React.useState<ChatEvent[]>(script.intro);
  const [visible, setVisible] = React.useState(0);
  const [choiceId, setChoiceId] = React.useState<string | null>(null);

  const isAppendingRef = React.useRef(false);

  // Restart the conversation when the scenario or language flips.
  React.useEffect(() => {
    if (isAppendingRef.current) {
      isAppendingRef.current = false;
      return;
    }
    setEvents(script.intro);
    setVisible(0);
    setChoiceId(null);
    setPlayed([scenario]);
  }, [script]);

  const atDecision = events[visible - 1]?.kind === 'decision' && choiceId === null;

  // Advance the script while in view; hold at the decision point.
  React.useEffect(() => {
    if (!inView || atDecision || visible >= events.length) return;
    if (reduceMotion && visible === 0) {
      // Reduced motion: jump straight to the decision point.
      const decisionIndex = events.findIndex((e) => e.kind === 'decision');
      setVisible(decisionIndex === -1 ? events.length : decisionIndex + 1);
      return;
    }
    const id = window.setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 400 : STEP_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [inView, visible, events, atDecision, reduceMotion]);

  const decide = React.useCallback(
    (choice: Choice) => {
      setChoiceId(choice.id);
      setEvents((prev) => [...prev, { kind: 'user', text: choice.label }, ...choice.events]);
      setVisible((v) => v + 1);
    },
    [],
  );

  // If the visitor doesn't pick, take the recommended path after a pause.
  React.useEffect(() => {
    if (!atDecision || reduceMotion) return;
    const id = window.setTimeout(() => {
      decide(script.choices.find((c) => c.recommended) ?? script.choices[0]);
    }, AUTO_DECIDE_MS);
    return () => window.clearTimeout(id);
  }, [atDecision, decide, script, reduceMotion]);

  // Keep the newest message in view inside the fixed-height chat.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [visible, reduceMotion]);

  const shown = events.slice(0, visible).filter((e) => e.kind !== 'decision');
  // The newest tool call spins while the script is still advancing.
  const running = visible < events.length && !atDecision;

  const isFinished = visible >= events.length && choiceId !== null;

  const handleInputClick = React.useCallback(() => {
    if (!isFinished) return;
    isAppendingRef.current = true;

    const available = Array.from({ length: SCENARIO_COUNT }, (_, i) => i).filter(
      (idx) => !played.includes(idx)
    );

    let nextScenario: number;
    let nextPlayed: number[];

    if (available.length === 0) {
      const resetAvailable = Array.from({ length: SCENARIO_COUNT }, (_, i) => i).filter(
        (idx) => idx !== scenario
      );
      nextScenario = resetAvailable[Math.floor(Math.random() * resetAvailable.length)];
      nextPlayed = [nextScenario];
    } else {
      nextScenario = available[Math.floor(Math.random() * available.length)];
      nextPlayed = [...played, nextScenario];
    }

    setPlayed(nextPlayed);

    const nextScript = SCRIPTS[lang][nextScenario];
    setEvents((prev) => [...prev, ...nextScript.intro]);
    setChoiceId(null);
    setScenario(nextScenario);
  }, [isFinished, scenario, played, lang]);

  return (
    <section id="mcp" className="relative border-t border-white/5 bg-night-950">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.mcp.heading}</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">{t.mcp.subtitle}</p>
        </div>

        {/* Fixed height — messages scroll inside, the page never shifts. */}
        <div
          ref={chatRef}
          className="mx-auto mt-12 flex h-[600px] max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-900 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <Bot className="h-4 w-4 text-ink" aria-hidden="true" />
            <span className="text-sm font-medium text-ink">Liquid Flow</span>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">MCP</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {shown.map((event, i) => (
              <Message key={i} event={event} done={i < shown.length - 1 || !running} />
            ))}

            <AnimatePresence>
              {atDecision && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="flex flex-wrap gap-2 pl-10"
                >
                  {script.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => decide(choice)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.97] ${
                        choice.recommended
                          ? 'border-ink bg-ink text-night-950 hover:bg-white'
                          : 'border-white/15 text-ink-muted hover:border-white/30 hover:text-ink'
                      }`}
                    >
                      {choice.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Inert / Interactive composer */}
          <div className="border-t border-white/5 p-3">
            <motion.div
              role={isFinished ? 'button' : undefined}
              tabIndex={isFinished ? 0 : -1}
              onClick={handleInputClick}
              onKeyDown={(e) => {
                if (isFinished && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleInputClick();
                }
              }}
              whileHover={isFinished ? { scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              whileTap={isFinished ? { scale: 0.99 } : undefined}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition-all duration-300 select-none ${
                isFinished
                  ? 'cursor-pointer border-white/20 bg-white/[0.06] hover:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-white/30'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <span
                className={`flex-1 text-sm transition-colors duration-300 ${
                  isFinished ? 'text-ink font-medium' : 'text-ink-muted/60'
                }`}
              >
                {t.mcp.inputPlaceholder}
              </span>
              <Paperclip
                className={`h-4 w-4 transition-colors duration-300 ${
                  isFinished ? 'text-ink-muted/80' : 'text-ink-muted/50'
                }`}
                aria-hidden="true"
              />
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
                  isFinished ? 'bg-ink text-night-950 scale-105 shadow-md shadow-white/10' : 'bg-white/10 text-ink-muted'
                }`}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
