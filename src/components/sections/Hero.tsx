'use client';

import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Github } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import { AppDemo } from '../demo/AppDemo';
import { GITHUB_URL } from '../Navbar';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

export function Hero() {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE_OUT },
  });

  return (
    <section id="top" className="relative pt-36 sm:pt-44">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h1
          {...fadeUp(0)}
          className="max-w-4xl text-balance font-ui text-[2.5rem] font-semibold leading-[1.06] tracking-tight text-ink sm:text-6xl md:text-[4.25rem]"
        >
          {t.hero.title1} {t.hero.title2}
        </motion.h1>

        <motion.div
          {...fadeUp(0.1)}
          className="mt-8 flex flex-col gap-6 sm:mt-10 sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.hero.subtitle}
          </p>
          <a
            href="#mcp"
            className="group flex shrink-0 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <span className="font-medium text-ink">{t.hero.newLabel}</span>
            {t.hero.newLink}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </motion.div>

        <motion.div {...fadeUp(0.18)} className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-night-950 transition-[background-color,transform] hover:bg-white active:scale-[0.97]"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            {t.hero.ctaPrimary}
          </a>
          <a
            href="#cli"
            className="rounded-full px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            {t.hero.ctaSecondary}
          </a>
        </motion.div>
      </div>

      {/* The real app — fully visible, floating on a soft light floor. */}
      <div id="demo" className="relative mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6">
        {/* Gradient floor behind/beneath the window, like Linear's hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-16 -bottom-24"
          style={{
            background:
              'radial-gradient(80% 90% at 50% 100%, rgba(148, 163, 184, 0.16) 0%, rgba(148, 163, 184, 0.05) 45%, transparent 75%)',
          }}
        />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease: EASE_OUT }}
          className="dark relative rounded-2xl ring-1 ring-white/10"
        >
          <AppDemo />
        </motion.div>
      </div>
    </section>
  );
}
