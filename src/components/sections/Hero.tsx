'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Github, MousePointerClick } from 'lucide-react';
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
    <section id="top" className="relative overflow-hidden pt-32 sm:pt-40">
      {/* Backdrop glow behind the headline and window */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(51, 101, 255, 0.18) 0%, rgba(51, 101, 255, 0.05) 45%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <motion.p
          {...fadeUp(0)}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-feedback-success" aria-hidden="true" />
          {t.hero.badge}
        </motion.p>

        <motion.h1
          {...fadeUp(0.08)}
          className="mx-auto max-w-4xl font-display text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl"
        >
          {t.hero.title1}
          <br />
          <span className="bg-gradient-to-r from-brand-soft to-brand bg-clip-text text-transparent">
            {t.hero.title2}
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.16)}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-[background-color,transform] hover:bg-brand/90 active:scale-[0.97]"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            {t.hero.ctaPrimary}
          </a>
          <a
            href="#cli"
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/30 hover:text-white"
          >
            {t.hero.ctaSecondary}
          </a>
        </motion.div>

        <motion.p
          {...fadeUp(0.32)}
          className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-500"
        >
          <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
          {t.hero.demoHint}
        </motion.p>
      </div>

      {/* The real app, half-visible SaaS-hero style: the section clips the
          window's lower part; the next section's top edge completes the cut. */}
      <div id="demo" className="relative mx-auto mt-6 max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36, ease: EASE_OUT }}
          className="max-h-[420px] overflow-hidden rounded-t-2xl sm:max-h-[520px]"
        >
          <AppDemo />
        </motion.div>
        {/* Soft fade where the window is cut, so the crop reads intentional */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 bottom-0 h-24 bg-gradient-to-t from-night-950 to-transparent sm:inset-x-6"
        />
      </div>
    </section>
  );
}
