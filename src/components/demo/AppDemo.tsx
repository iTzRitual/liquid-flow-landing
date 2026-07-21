'use client';

import * as React from 'react';
import { WindowChrome } from '@ds/templates/WindowChrome';
import { HubScreen } from '@ds/screens/HubScreen';
import { useLang } from '@/i18n/LanguageProvider';
import { ConflictsTab } from './ConflictsTab';
import { GitTab } from './GitTab';
import {
  demoShops,
  demoFileTree,
  logScript,
  initialLog,
  initialConflicts,
  initialHistory,
  resolvedLogMessage,
  checkpointLogMessage,
  checkpointCommit,
  type DemoLogEntry,
  type DemoConflict,
  type DemoTone,
} from './demoData';

/* The app window renders at a larger internal canvas and is scaled down to fit
 * the container — so the UI reads denser (~0.75× zoom vs. the 1080 native): the
 * shop rail takes a smaller share of the width, leaving more room for the file
 * tree and the activity log. Layout inside stays pixel-identical with the app. */
const BASE_WIDTH = 1440;
const BASE_HEIGHT = 1040;

const MAX_LOG = 100;
const SCRIPT_INTERVAL_MS = 2600;

function timeAt(step: number): string {
  const total = 12 * 3600 + 4 * 60 + step * 3;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function AppDemo({ className }: { className?: string }) {
  const { lang, t } = useLang();
  const demo = t.demo;

  const [currentShopId, setCurrentShopId] = React.useState('demo-1');
  const [entries, setEntries] = React.useState<DemoLogEntry[]>(initialLog[lang]);
  const [conflicts, setConflicts] = React.useState<DemoConflict[]>(initialConflicts);
  const [history, setHistory] = React.useState(initialHistory[lang]);
  const [ahead, setAhead] = React.useState(2);
  const [autoCommit, setAutoCommit] = React.useState(true);

  const stepRef = React.useRef(0);
  const idRef = React.useRef(100);
  const autoCommitRef = React.useRef(autoCommit);
  autoCommitRef.current = autoCommit;

  // The demo "session" restarts in the new language when the toggle flips.
  React.useEffect(() => {
    setEntries(initialLog[lang]);
    setHistory(initialHistory[lang]);
  }, [lang]);

  const pushLog = React.useCallback((tone: DemoTone, message: string) => {
    stepRef.current += 1;
    idRef.current += 1;
    const entry: DemoLogEntry = {
      id: idRef.current,
      time: timeAt(stepRef.current),
      tone,
      message,
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_LOG));
  }, []);

  // The looping hot-reload story in the Aktywność tab.
  React.useEffect(() => {
    let scriptIndex = 0;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const script = logScript[lang];
      let next = script[scriptIndex % script.length];
      // With auto-commit off, the wip-commit beat is skipped — same as the app.
      if (!autoCommitRef.current && next.message.startsWith('Auto-commit')) {
        scriptIndex += 1;
        next = script[scriptIndex % script.length];
      }
      scriptIndex += 1;
      if (next.message.startsWith('Auto-commit')) {
        setAhead((prev) => prev + 1);
      }
      pushLog(next.tone, next.message);
    }, SCRIPT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [lang, pushLog]);

  const handleResolve = React.useCallback(
    (conflict: DemoConflict) => {
      setConflicts((prev) => prev.filter((c) => c.id !== conflict.id));
      pushLog('success', resolvedLogMessage[lang](conflict.file));
    },
    [lang, pushLog],
  );

  const handleCheckpoint = React.useCallback(() => {
    setAhead(0);
    setHistory((prev) => [
      { hash: Math.random().toString(16).slice(2, 9), subject: checkpointCommit[lang], date: '2026-07-13' },
      ...prev,
    ]);
    pushLog('info', checkpointLogMessage[lang]);
  }, [lang, pushLog]);

  const handlePush = React.useCallback(() => {
    pushLog('success', lang === 'pl' ? 'git push origin main — wysłano' : 'git push origin main — done');
  }, [lang, pushLog]);

  const currentShop = demoShops.find((s) => s.Id === currentShopId) ?? demoShops[0];

  // Scale-to-fit: render at the internal canvas size, shrink with the container.
  // Measured synchronously on mount so the first paint is already scaled — no
  // one-frame flash of the 1440px canvas overflowing the ~1200px container.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setScale(Math.min(1, el.getBoundingClientRect().width / BASE_WIDTH));
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / BASE_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ height: BASE_HEIGHT * scale }}>
      <div
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <WindowChrome platform="mac">
          <HubScreen
            shops={demoShops}
            currentShopId={currentShopId}
            onSelectShop={(shop) => setCurrentShopId(shop.Id)}
            templateName="Topaz — Główny"
            templateId={42}
            shopName={currentShop.Name}
            shopUrl={currentShop.Url.replace(/^https?:\/\//, '')}
            conflictCount={conflicts.length}
            fileTree={demoFileTree}
            logEntries={entries}
            labels={{
              shops: demo.shopsLabel,
              addShop: demo.addShop,
              id: demo.id,
              ok: demo.ok,
              openFolder: demo.openFolder,
              openShop: demo.openShop,
              refresh: demo.refresh,
              files: demo.files,
              tabActivity: demo.tabActivity,
              tabConflicts: demo.tabConflicts,
              tabGit: demo.tabGit,
              emptyLog: demo.emptyLog,
            }}
            conflictsSlot={<ConflictsTab conflicts={conflicts} onResolve={handleResolve} t={demo} />}
            gitSlot={
              <GitTab
                history={history}
                ahead={ahead}
                autoCommit={autoCommit}
                onAutoCommitChange={setAutoCommit}
                onCheckpoint={handleCheckpoint}
                onPush={handlePush}
                t={demo}
              />
            }
          />
        </WindowChrome>
      </div>
    </div>
  );
}
