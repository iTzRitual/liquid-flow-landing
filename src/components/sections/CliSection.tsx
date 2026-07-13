'use client';

import * as React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useLang } from '@/i18n/LanguageProvider';
import { Terminal } from './Terminal';

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

function StepPanel({
  index,
  title,
  body,
  lang,
  width = 'w-screen',
}: {
  index: number;
  title: string;
  body: string;
  lang: 'pl' | 'en';
  width?: string;
}) {
  return (
    <div className={`flex ${width} shrink-0 items-center justify-center px-4 sm:px-6`}>
      <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            {String(index + 1).padStart(2, '0')} / 04
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            <InlineCode text={title} />
          </h3>
          <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
            <InlineCode text={body} />
          </p>
        </div>
        <Terminal frame={index} lang={lang} />
      </div>
    </div>
  );
}

/* Scroll length per stage — 120vh of vertical travel per panel keeps the
 * horizontal ride deliberate, so stages can't be skipped past. */
const VH_PER_STAGE = 120;

export function CliSection() {
  const { lang, t } = useLang();
  const reduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const steps = t.cli.steps;
  // Piecewise mapping with plateaus: each stage rests centred for a stretch of
  // scroll before the track slides to the next one, so no stage flies past.
  const { input, output } = React.useMemo(() => {
    const n = steps.length;
    const pad = 0.09; // half-width of each plateau, in scroll-progress units
    const inp: number[] = [];
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const centre = i / (n - 1);
      inp.push(Math.max(0, centre - pad), Math.min(1, centre + pad));
      out.push(`-${i * 100}vw`, `-${i * 100}vw`);
    }
    return { input: inp, output: out };
  }, [steps.length]);
  const x = useTransform(scrollYProgress, input, output);

  if (reduceMotion) {
    // Reduced motion: a plain vertical stack, no sticky horizontal ride.
    return (
      <section id="cli" className="border-t border-white/5 bg-night-900">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <CliHeading heading={t.cli.heading} subtitle={t.cli.subtitle} />
          <div className="mt-16 flex flex-col gap-20">
            {steps.map((step, i) => (
              <StepPanel key={i} index={i} title={step.title} body={step.body} lang={lang} width="w-full" />
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
      className="relative border-t border-white/5 bg-night-900"
      style={{ height: `${steps.length * VH_PER_STAGE + 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <CliHeading heading={t.cli.heading} subtitle={t.cli.subtitle} />
        </div>

        <motion.div style={{ x }} className="mt-10 flex will-change-transform">
          {steps.map((step, i) => (
            <StepPanel key={i} index={i} title={step.title} body={step.body} lang={lang} />
          ))}
        </motion.div>

        <ProgressDots progress={scrollYProgress} count={steps.length} />
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
  progress,
  count,
}: {
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  count: number;
}) {
  const [active, setActive] = React.useState(0);
  React.useEffect(
    () => progress.on('change', (v) => setActive(Math.min(count - 1, Math.round(v * (count - 1))))),
    [progress, count],
  );
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
