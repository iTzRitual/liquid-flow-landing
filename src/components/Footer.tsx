'use client';

import { Github } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import { GITHUB_URL } from './Navbar';

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-white/5 bg-night-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-1 font-display text-lg">
            <span className="font-black text-white">Liquid</span>
            <span className="font-black text-brand">Flow</span>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            iTzRitual/liquid-flow
          </a>
        </div>
        <p className="text-sm text-slate-400">{t.footer.tagline}</p>
        <p className="text-xs leading-relaxed text-slate-500">{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
