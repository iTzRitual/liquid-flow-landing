'use client';

import * as React from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUp, Bot, Check, Loader2, Paperclip, User } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import type { Lang } from '@/i18n/dictionaries';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const STEP_DELAY_MS = 1300;
const AUTO_DECIDE_MS = 6500;

/* ————— The scripted workflow ————— */

type ChatEvent =
  | { kind: 'user'; text: string }
  | { kind: 'agent'; text: string }
  | { kind: 'tool'; tool: string; args: string; result: string }
  | { kind: 'decision' };

interface Choice {
  id: string;
  label: string;
  recommended?: boolean;
  /** Events appended after the visitor picks this choice. */
  events: ChatEvent[];
}

interface Script {
  intro: ChatEvent[];
  choices: Choice[];
}

const SCRIPTS: Record<Lang, Script> = {
  pl: {
    intro: [
      { kind: 'user', text: 'Sprawdź konflikty w sklepie Ogródek i pomóż mi je rozwiązać.' },
      { kind: 'tool', tool: 'get_mismatches', args: '{}', result: '2 konflikty' },
      { kind: 'agent', text: 'Masz 2 konflikty z panelem administracyjnym. Sprawdzam, co dokładnie się różni…' },
      {
        kind: 'tool',
        tool: 'preview_conflict',
        args: '"components/header.liquid"',
        result: 'lokalny nowszy o 2 h',
      },
      {
        kind: 'tool',
        tool: 'preview_conflict',
        args: '"css/theme.css"',
        result: 'zmieniony w panelu 20 min temu',
      },
      {
        kind: 'agent',
        text:
          'header.liquid — Twoja lokalna wersja jest nowsza: przebudowany nagłówek i dodane menu mobilne.\n' +
          'theme.css — zmieniony w panelu: ktoś poprawił kolory przycisków w promocji.\n\n' +
          'Które wersje mam zachować?',
      },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'mixed',
        label: 'Lokalny header, theme ze sklepu',
        recommended: true,
        events: [
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"components/header.liquid" → push',
            result: 'nadpisano wersję w sklepie',
          },
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"css/theme.css" → pull',
            result: 'pobrano wersję z panelu',
          },
          {
            kind: 'tool',
            tool: 'git_checkpoint',
            args: '"merge: header lokalny, theme z panelu"',
            result: 'squash wip → main (f3d9a21)',
          },
          {
            kind: 'agent',
            text:
              'Gotowe. Nagłówek z menu mobilnym jest już w sklepie, kolory przycisków z panelu zostały pobrane lokalnie, a całość zabezpieczyłem checkpointem na main.',
          },
        ],
      },
      {
        id: 'local',
        label: 'Zachowaj obie lokalne',
        events: [
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"components/header.liquid" → push',
            result: 'nadpisano wersję w sklepie',
          },
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"css/theme.css" → push',
            result: 'nadpisano wersję w sklepie',
          },
          {
            kind: 'tool',
            tool: 'git_checkpoint',
            args: '"resolve: wersje lokalne"',
            result: 'squash wip → main (b81c4e0)',
          },
          {
            kind: 'agent',
            text:
              'Zrobione — obie lokalne wersje są w sklepie. Uwaga: zmiana kolorów z panelu została nadpisana; masz ją w historii Git, gdyby trzeba było wrócić.',
          },
        ],
      },
      {
        id: 'remote',
        label: 'Pobierz obie ze sklepu',
        events: [
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"components/header.liquid" → pull',
            result: 'pobrano wersję z panelu',
          },
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"css/theme.css" → pull',
            result: 'pobrano wersję z panelu',
          },
          {
            kind: 'tool',
            tool: 'git_checkpoint',
            args: '"resolve: wersje z panelu"',
            result: 'squash wip → main (9d2e77c)',
          },
          {
            kind: 'agent',
            text:
              'Pobrane — folder lokalny odpowiada teraz sklepowi. Twoja wcześniejsza praca nad nagłówkiem jest bezpieczna w historii Git.',
          },
        ],
      },
    ],
  },
  en: {
    intro: [
      { kind: 'user', text: 'Check the Ogródek shop for conflicts and help me resolve them.' },
      { kind: 'tool', tool: 'get_mismatches', args: '{}', result: '2 conflicts' },
      { kind: 'agent', text: 'You have 2 conflicts with the admin panel. Checking what exactly differs…' },
      {
        kind: 'tool',
        tool: 'preview_conflict',
        args: '"components/header.liquid"',
        result: 'local newer by 2 h',
      },
      {
        kind: 'tool',
        tool: 'preview_conflict',
        args: '"css/theme.css"',
        result: 'changed in panel 20 min ago',
      },
      {
        kind: 'agent',
        text:
          'header.liquid — your local version is newer: rebuilt header plus a new mobile menu.\n' +
          'theme.css — changed in the panel: someone tweaked button colors for a promo.\n\n' +
          'Which versions should I keep?',
      },
      { kind: 'decision' },
    ],
    choices: [
      {
        id: 'mixed',
        label: 'Local header, theme from shop',
        recommended: true,
        events: [
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"components/header.liquid" → push',
            result: 'shop version overwritten',
          },
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"css/theme.css" → pull',
            result: 'panel version pulled',
          },
          {
            kind: 'tool',
            tool: 'git_checkpoint',
            args: '"merge: local header, panel theme"',
            result: 'squash wip → main (f3d9a21)',
          },
          {
            kind: 'agent',
            text:
              'Done. The header with the mobile menu is live in the shop, the panel button colors are pulled locally, and everything is secured with a checkpoint on main.',
          },
        ],
      },
      {
        id: 'local',
        label: 'Keep both local',
        events: [
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"components/header.liquid" → push',
            result: 'shop version overwritten',
          },
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"css/theme.css" → push',
            result: 'shop version overwritten',
          },
          {
            kind: 'tool',
            tool: 'git_checkpoint',
            args: '"resolve: local versions"',
            result: 'squash wip → main (b81c4e0)',
          },
          {
            kind: 'agent',
            text:
              'Done — both local versions are in the shop. Note: the panel color change was overwritten; it stays in Git history if you need it back.',
          },
        ],
      },
      {
        id: 'remote',
        label: 'Pull both from shop',
        events: [
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"components/header.liquid" → pull',
            result: 'panel version pulled',
          },
          {
            kind: 'tool',
            tool: 'resolve_conflict',
            args: '"css/theme.css" → pull',
            result: 'panel version pulled',
          },
          {
            kind: 'tool',
            tool: 'git_checkpoint',
            args: '"resolve: panel versions"',
            result: 'squash wip → main (9d2e77c)',
          },
          {
            kind: 'agent',
            text:
              'Pulled — your local folder now matches the shop. Your earlier header work is safe in Git history.',
          },
        ],
      },
    ],
  },
};

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
      <motion.div {...base} className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
          <User className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        </span>
        <p className="rounded-xl rounded-tl-sm bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-ink">
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
  const script = SCRIPTS[lang];

  const chatRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(chatRef, { once: true, amount: 0.4 });

  /** Full event list currently playing: intro, then the chosen branch. */
  const [events, setEvents] = React.useState<ChatEvent[]>(script.intro);
  const [visible, setVisible] = React.useState(0);
  const [choiceId, setChoiceId] = React.useState<string | null>(null);

  // Restart the conversation when the language flips.
  React.useEffect(() => {
    setEvents(script.intro);
    setVisible(0);
    setChoiceId(null);
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

          {/* Inert composer, purely for the Linear-agent look */}
          <div className="border-t border-white/5 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
              <span className="flex-1 select-none text-sm text-ink-muted/60">{t.mcp.inputPlaceholder}</span>
              <Paperclip className="h-4 w-4 text-ink-muted/50" aria-hidden="true" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <ArrowUp className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
