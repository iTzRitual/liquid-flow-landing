'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
          <code key={i} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-soft">
            {part}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

function Step({
  index,
  title,
  body,
  active,
  onActivate,
}: {
  index: number;
  title: string;
  body: string;
  active: boolean;
  onActivate: (index: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onActivate(index);
      },
      // A narrow horizontal band around the viewport centre: the step whose
      // content crosses it owns the terminal frame.
      { rootMargin: '-45% 0px -45% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onActivate]);

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={`border-l-2 py-10 pl-6 transition-colors duration-300 sm:py-14 ${
        active ? 'border-brand' : 'border-white/10'
      }`}
    >
      <p className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${active ? 'text-brand-soft' : 'text-slate-600'}`}>
        {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">
        <InlineCode text={title} />
      </h3>
      <p className="mt-3 max-w-md leading-relaxed text-slate-400">
        <InlineCode text={body} />
      </p>
    </motion.div>
  );
}

export function CliSection() {
  const { lang, t } = useLang();
  const [active, setActive] = React.useState(0);
  const handleActivate = React.useCallback((index: number) => setActive(index), []);

  return (
    <section id="cli" className="relative border-t border-white/5 bg-night-900">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">{t.cli.heading}</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            <InlineCode text={t.cli.subtitle} />
          </p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Steps drive the frame; on mobile the terminal sticks above them. */}
          <div className="order-2 lg:order-1">
            {t.cli.steps.map((step, i) => (
              <Step
                key={i}
                index={i}
                title={step.title}
                body={step.body}
                active={active === i}
                onActivate={handleActivate}
              />
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <div className="sticky top-20 lg:top-32">
              <Terminal frame={active} lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
