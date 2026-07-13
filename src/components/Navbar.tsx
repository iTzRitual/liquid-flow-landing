'use client';

import { Github } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';

const GITHUB_URL = 'https://github.com/iTzRitual/liquid-flow';

export function Navbar() {
  const { lang, t, setLang } = useLang();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-night-950/70 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-baseline gap-1 font-display text-lg">
          <span className="font-black text-white">Liquid</span>
          <span className="font-black text-brand">Flow</span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          <a href="#demo" className="hidden rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink sm:block">
            {t.nav.features}
          </a>
          <a href="#cli" className="hidden rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink sm:block">
            {t.nav.cli}
          </a>
          <a href="#mcp" className="hidden rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink sm:block">
            {t.nav.mcp}
          </a>

          <button
            type="button"
            onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')}
            className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-xs uppercase text-slate-300 transition-colors hover:border-white/25 hover:text-white"
            aria-label={lang === 'pl' ? 'Switch to English' : 'Przełącz na polski'}
          >
            {lang === 'pl' ? 'EN' : 'PL'}
          </button>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-1 flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-night-950 transition-colors hover:bg-white"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            {t.nav.github}
          </a>
        </div>
      </nav>
    </header>
  );
}

export { GITHUB_URL };
