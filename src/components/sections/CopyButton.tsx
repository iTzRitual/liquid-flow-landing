'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Copy } from 'lucide-react';

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

export function CopyButton({
  text,
  copyLabel,
  copiedLabel,
}: {
  text: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable or denied — leave the button in its normal state.
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors hover:border-white/25 hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="flex items-center gap-1.5 text-feedback-success"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {copiedLabel}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {copyLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
