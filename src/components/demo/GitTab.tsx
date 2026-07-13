'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Text } from '@ds/atoms/Text';
import { Badge } from '@ds/atoms/Badge';
import { Button } from '@ds/atoms/Button';
import { Switch } from '@ds/atoms/Switch';
import { GitBranch, Check, Upload } from '@ds/foundations/icons';
import type { Dictionary } from '@/i18n/dictionaries';
import type { DemoCommit } from './demoData';

export interface GitTabProps {
  history: DemoCommit[];
  ahead: number;
  autoCommit: boolean;
  onAutoCommitChange: (checked: boolean) => void;
  onCheckpoint: () => void;
  onPush: () => void;
  t: Dictionary['demo'];
}

/** Landing-side composition of the Git-Backup tab from DS atoms. */
export function GitTab({ history, ahead, autoCommit, onAutoCommitChange, onCheckpoint, onPush, t }: GitTabProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-base px-3 py-2.5">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <Text variant="body-md" className="font-mono text-[12px]">liquidflow/wip</Text>
          {ahead > 0 ? (
            <Badge variant="warning">{t.gitCommitsAhead(ahead)}</Badge>
          ) : (
            <Badge variant="successSoft">
              <Check className="h-3 w-3" aria-hidden="true" />
              main
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onCheckpoint} disabled={ahead === 0}>
            {t.gitCheckpoint}
          </Button>
          <Button size="sm" variant="primary" onClick={onPush} disabled={ahead > 0}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            {t.gitPush}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <Text variant="label-md" tone="secondary">{t.gitAutoCommit}</Text>
        <Switch checked={autoCommit} onCheckedChange={onAutoCommitChange} />
      </div>

      <div className="flex flex-col gap-1">
        <Text variant="label-md" tone="secondary" className="px-1">{t.gitHistory}</Text>
        <AnimatePresence initial={false}>
          {history.map((commit) => (
            <motion.div
              key={commit.hash}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-muted"
            >
              <Text variant="caption-md" tone="muted" className="font-mono">{commit.hash}</Text>
              <Text variant="body-md" className="min-w-0 flex-1 truncate">{commit.subject}</Text>
              <Text variant="caption-md" tone="muted">{commit.date}</Text>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
