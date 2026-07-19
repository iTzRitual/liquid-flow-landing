'use client';

import * as React from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
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
 * left while the next one rides in from the right — simultaneously (both share
 * a single grid cell), so there is never an empty in-between state. Stacking in
 * a grid rather than absolutely means a tip can never spill over the terminal
 * below; every step's TipContent is also rendered invisibly stacked in that
 * same cell (see the sizers below) so the cell is always as tall as the
 * tallest tip and never resizes when the exiting tip unmounts mid-crossfade. */
const tipVariants = {
  enter: (dir: number) => ({ x: 64 * dir, opacity: 0, filter: 'blur(10px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: -64 * dir, opacity: 0, filter: 'blur(10px)' }),
};

export function CliSection() {
  const { lang, t } = useLang();
  const reduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  // The cold-boot intro (typing `/connect`) fires when the pinned stage scrolls
  // into view — not on page load, when it would play unseen far above the fold.
  const stageRef = React.useRef<HTMLDivElement>(null);
  const stageInView = useInView(stageRef, { once: true, amount: 0.6 });
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
      // Clamped in px so the scroll ride stops scaling on huge viewports —
      // below ~1100px of viewport height this is identical to the plain
      // `${n * VH_PER_STAGE + 100}vh` it replaces.
      style={{ height: `calc(${n} * min(${VH_PER_STAGE}vh, 1400px) + min(100vh, 1200px))` }}
    >
      {/* Below lg the heading rides in normal flow at the top of the section and
          scrolls away as the pinned stage takes over — it can't share the tight
          one-column sticky stage. On lg+ it lives inside the pinned stage instead. */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-24 sm:px-6 lg:hidden">
        <CliHeading heading={t.cli.heading} subtitle={t.cli.subtitle} />
      </div>

      {/* `my-auto` centres the stage like `justify-center`, but degrades safely:
          when the content is taller than the viewport it pins to the top with
          padding instead of clipping the heading off-screen. The stage height
          is capped at 1200px so it doesn't balloon into a mostly-empty pinned
          screen on huge viewports; `top` re-centers the capped stage in taller
          viewports instead of leaving it glued to the top. Below 1200px of
          viewport height both resolve to their old values (h-screen, top-0). */}
      <div
        className="sticky flex h-screen max-h-[1200px] flex-col overflow-hidden"
        style={{ top: 'max(0px, calc((100vh - 1200px) / 2))' }}
      >
        <div className="mx-auto my-auto w-full max-w-6xl px-4 pb-4 pt-14 sm:px-6 lg:py-10">
          {/* On lg+ the heading sits inside the pinned stage; below lg it scrolls
              above in normal flow (rendered separately, higher in the section). */}
          <div className="hidden lg:block">
            <CliHeading heading={t.cli.heading} subtitle={t.cli.subtitle} />
          </div>

          {/* The terminal stays put in the centre; only the tip column swaps. */}
          <div
            ref={stageRef}
            className="grid items-center gap-4 lg:mt-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14"
          >
            <div className="grid">
              {/* Invisible sizers: every step stacked in the same cell, never animated,
                  so the cell's height is always the tallest tip and doesn't shift when
                  the exiting tip unmounts. Hidden from layout participants other than
                  sizing — no pointer events, no a11y tree presence. */}
              {steps.map((step, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="invisible col-start-1 row-start-1 self-start pointer-events-none"
                >
                  <TipContent index={i} count={n} title={step.title} body={step.body} />
                </div>
              ))}
              <AnimatePresence initial={false} custom={dirRef.current}>
                <motion.div
                  key={stage}
                  custom={dirRef.current}
                  variants={tipVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="col-start-1 row-start-1 self-start"
                >
                  <TipContent index={stage} count={n} title={steps[stage].title} body={steps[stage].body} />
                </motion.div>
              </AnimatePresence>
            </div>
            <Terminal stage={stage} lang={lang} active={stageInView} />
          </div>

          <ProgressDots active={stage} count={n} scrollYProgress={scrollYProgress} />
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

function ProgressDots({
  active,
  count,
  scrollYProgress,
}: {
  active: number;
  count: number;
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 lg:mt-10" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <ProgressDot
          key={i}
          index={i}
          active={i === active}
          complete={i < active}
          count={count}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

/* The active dot doubles as a track: a solid fill grows across it as the user
 * scrolls through its stage window, giving mid-stage feedback the old
 * discrete flip couldn't. Every dot gets its own transform unconditionally
 * (hooks can't be conditional). The fill also stays mounted for completed
 * dots (scaleX clamped to 1, so it reads solid) — the track's background is
 * a constant white/20 so only width transitions, otherwise the outgoing dot's
 * bg-color tween and the fill's unmount would race and flicker. */
function ProgressDot({
  index,
  active,
  complete,
  count,
  scrollYProgress,
}: {
  index: number;
  active: boolean;
  complete: boolean;
  count: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Stage `i`'s window is [(i-0.5)/(n-1), (i+0.5)/(n-1)], clamped to [0, 1] —
  // the first and last stages only get a half window at the section edges.
  const start = index === 0 ? 0 : (index - 0.5) / (count - 1);
  const end = index === count - 1 ? 1 : (index + 0.5) / (count - 1);
  const fill = useTransform(scrollYProgress, [start, end], [0, 1], { clamp: true });

  return (
    <span
      className={`h-1.5 overflow-hidden rounded-full bg-white/20 transition-all duration-300 ${
        active ? 'w-6' : 'w-1.5'
      }`}
    >
      {/* motion.span, not motion.div — a span can't contain block-level children. */}
      {(active || complete) && (
        <motion.span
          className="block h-full w-full origin-left rounded-full bg-ink"
          style={{ scaleX: fill }}
        />
      )}
    </span>
  );
}
