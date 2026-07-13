'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Text } from '@ds/atoms/Text';
import { Badge } from '@ds/atoms/Badge';
import { Button } from '@ds/atoms/Button';
import { Download, Upload, Check } from '@ds/foundations/icons';
import type { Dictionary } from '@/i18n/dictionaries';
import type { DemoConflict, ConflictKind } from './demoData';

const KIND_BADGE: Record<ConflictKind, { variant: 'warning' | 'successSoft' | 'neutral'; key: 'conflictLocal' | 'conflictRemote' | 'conflictLocalMissing' }> = {
  local: { variant: 'successSoft', key: 'conflictLocal' },
  remote: { variant: 'warning', key: 'conflictRemote' },
  localMissing: { variant: 'neutral', key: 'conflictLocalMissing' },
};

export interface ConflictsTabProps {
  conflicts: DemoConflict[];
  onResolve: (conflict: DemoConflict, action: 'pull' | 'push') => void;
  t: Dictionary['demo'];
}

/** Landing-side composition of the Konflikty tab from DS atoms — the app's
 * container wires this to the sync engine; here it plays against demo state. */
export function ConflictsTab({ conflicts, onResolve, t }: ConflictsTabProps) {
  const reduceMotion = useReducedMotion();

  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10">
        <Check className="h-6 w-6 text-feedback-success" aria-hidden="true" />
        <Text variant="body-md" tone="secondary">{t.conflictsEmpty}</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Text variant="label-md" tone="secondary">{t.conflictsTitle}</Text>
      <AnimatePresence initial={false}>
        {conflicts.map((conflict) => {
          const badge = KIND_BADGE[conflict.kind];
          return (
            <motion.div
              key={conflict.id}
              layout={!reduceMotion}
              initial={false}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-base px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Text variant="body-md" className="truncate font-mono text-[12px]">
                  {conflict.file}
                </Text>
                <Badge variant={badge.variant}>{t[badge.key]}</Badge>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => onResolve(conflict, 'pull')}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.pull}
                </Button>
                <Button size="sm" variant="primary" onClick={() => onResolve(conflict, 'push')}>
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.push}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
