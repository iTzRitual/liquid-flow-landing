'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Bug, Mail, Sparkles, Star } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import { GITHUB_URL } from '../Navbar';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

const CARDS = [
  { href: `${GITHUB_URL}/issues`, icon: Bug },
  { href: `${GITHUB_URL}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`, icon: Sparkles },
] as const;

const CONTACT_EMAIL = 'n.mokrzycki@icloud.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/natanmokrzycki/';

export function OpenSourceSection() {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(contentRef, { once: true, amount: 0.25 });

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
      {/* One cohesive band: invitation + primary CTA on the left, the two
          contribution paths on the right. Room below the grid is intentionally
          left open so a collaboration banner can be appended later. */}
      <div ref={contentRef} className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <motion.div {...fadeUp(0)}>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.openSource.heading}</h2>
            <p className="mt-4 leading-relaxed text-ink-muted">{t.openSource.subtitle}</p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-night-950 transition-[background-color,transform] hover:bg-white active:scale-[0.97]"
            >
              <Star className="h-4 w-4" aria-hidden="true" />
              {t.openSource.starCta}
            </a>
          </motion.div>

          <div className="grid gap-4">
            {t.openSource.cards.map((card, i) => {
              const { href, icon: Icon } = CARDS[i];
              return (
                <motion.a
                  key={card.title}
                  {...fadeUp(0.08 + i * 0.06)}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-night-900 p-6 transition-colors hover:border-white/20 hover:bg-white/[0.03]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-ink-muted transition-colors group-hover:text-ink">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-ink">{card.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{card.description}</p>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-ink-muted transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                    aria-hidden="true"
                  />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Collaboration band — commissioned work, first person singular (the
            author speaking), unlike the plural contribution copy above. */}
        <motion.div
          {...fadeUp(0.2)}
          className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-brand/[0.08] via-night-900 to-night-900 p-8 sm:flex-row sm:items-center"
        >
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">{t.openSource.collab.heading}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">{t.openSource.collab.pitch}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-night-950 transition-[background-color,transform] hover:bg-white active:scale-[0.97]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t.openSource.collab.ctaEmail}
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {t.openSource.collab.ctaLinkedin}
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
