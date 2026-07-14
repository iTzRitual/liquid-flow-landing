'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'motion/react';
import { useLang } from '@/i18n/LanguageProvider';
import { Terminal } from './Terminal';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

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

function TipContent({ index, count, title, body }: { index: number; count: number; title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        <InlineCode text={title} />
      </h3>
      <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
        <InlineCode text={body} />
      </p>
    </div>
  );
}

/* Scroll length per stage — 120vh of vertical travel per tip keeps the ride
 * deliberate, so stages can't be skipped past. */
const VH_PER_STAGE = 120;

/* Tips crossfade at breakpoints: the leaving one blurs and slides out to the
 * left while the next one rides in from the right — simultaneously (both are
 * absolutely positioned), so there is never an empty in-between state. */
const tipVariants = {
  enter: (dir: number) => ({ x: 64 * dir, opacity: 0, filter: 'blur(10px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: -64 * dir, opacity: 0, filter: 'blur(10px)' }),
};

export function CliSection() {
  const { lang, t } = useLang();
  const reduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const steps = t.cli.steps;
  const n = steps.length;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const [stage, setStage] = React.useState(0);
  const dirRef = React.useRef(1);
  React.useEffect(
    () =>
      scrollYProgress.on('change', (v) => {
        const next = Math.max(0, Math.min(n - 1, Math.round(v * (n - 1))));
        setStage((prev) => {
          if (next !== prev) dirRef.current = next > prev ? 1 : -1;
          return next;
        });
      }),
    [scrollYProgress, n],
  );

  if (reduceMotion) {
    // Reduced motion: a plain vertical stack, each stage as a static terminal.
    return (
      <section id="cli" className="bg-night-950">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <CliHeading heading={t.cli.heading} subtitle={t.cli.subtitle} />
          <div className="mt-16 flex flex-col gap-20">
            {steps.map((step, i) => (
              <div key={i} className="grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
                <TipContent index={i} count={n} title={step.title} body={step.body} />
                <Terminal stage={i} lang={lang} animate={false} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="cli"
      ref={sectionRef}
      className="relative bg-night-950"
      style={{ height: `${n * VH_PER_STAGE + 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <CliHeading heading={t.cli.heading} subtitle={t.cli.subtitle} />

          {/* The terminal stays put in the centre; only the tip column swaps. */}
          <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
            <div className="relative min-h-[168px] sm:min-h-[208px]">
              <AnimatePresence initial={false} custom={dirRef.current}>
                <motion.div
                  key={stage}
                  custom={dirRef.current}
                  variants={tipVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="absolute inset-x-0 top-0"
                >
                  <TipContent index={stage} count={n} title={steps[stage].title} body={steps[stage].body} />
                </motion.div>
              </AnimatePresence>
            </div>
            <Terminal stage={stage} lang={lang} />
          </div>

          <ProgressDots active={stage} count={n} />
        </div>
      </div>
    </section>
  );
}

function CliHeading({ heading, subtitle }: { heading: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{heading}</h2>
      <p className="mt-3 leading-relaxed text-ink-muted">
        <InlineCode text={subtitle} />
      </p>
    </div>
  );
}

function ProgressDots({ active, count }: { active: number; count: number }) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === active ? 'w-6 bg-ink' : 'w-1.5 bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}
