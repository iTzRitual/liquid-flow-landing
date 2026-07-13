#!/usr/bin/env bash
# Re-vendors the Liquid Flow design system from the sibling app repo, so the
# landing's embedded demo stays pixel-identical with the real application.
# Stories and tests are left behind — the landing only needs the components.
set -euo pipefail

SRC="${LIQUID_FLOW_REPO:-$(dirname "$0")/../../liquid-sync-mac}/apps/desktop/renderer/src/design-system"
DEST="$(dirname "$0")/../src/vendor/design-system"

if [ ! -d "$SRC" ]; then
  echo "Design system source not found: $SRC" >&2
  echo "Set LIQUID_FLOW_REPO to the liquid-flow checkout." >&2
  exit 1
fi

mkdir -p "$DEST"
rsync -a --delete \
  --exclude '*.stories.tsx' \
  --exclude '*.stories.jsx' \
  --exclude '*.test.tsx' \
  --exclude '*.test.jsx' \
  --exclude 'Tokens.stories.jsx' \
  "$SRC/" "$DEST/"

echo "Design system synced: $SRC -> $DEST"
