#!/bin/bash
set -euo pipefail

# Publish a dream from the workspace to Electric Sheep
# Usage: publish-dream.sh <source.md> [slug] [description]
#
# Reads the title from the first "# " line.
# Uses file mtime for the date if not obvious from filename.

SITE_DIR="$HOME/code/27b.io/electricsheep"
DREAMS_DIR="$SITE_DIR/content/dreams"
ZOLA="$HOME/.local/bin/zola"

SRC="${1:?Usage: publish-dream.sh <source.md> [slug] [description]}"
SLUG="${2:-$(basename "$SRC" .md)}"
DESC="${3:-}"

[ -f "$SRC" ] || { echo "File not found: $SRC" >&2; exit 1; }

# Extract title
TITLE=$(head -5 "$SRC" | grep -m1 '^# ' | sed 's/^# //' | sed 's/^Dream: //')
[ -z "$TITLE" ] && TITLE="$SLUG"

# Date from file
DATE=$(date -r "$SRC" +"%Y-%m-%dT%H:%M:%S+11:00")

DEST="$DREAMS_DIR/${SLUG}.md"

# Write front matter
cat > "$DEST" <<FRONT
+++
title = "$(echo "$TITLE" | sed 's/"/\\"/g')"
date = ${DATE}
description = "${DESC}"

[taxonomies]
tags = ["dream"]
+++

FRONT

# Append content, skipping first heading
tail -n +2 "$SRC" | sed '1{/^$/d}' >> "$DEST"

# Build to verify
cd "$SITE_DIR"
$ZOLA build --drafts 2>&1 | tail -3

# Commit and push
git add "$DEST"
git commit -m "dream: ${TITLE}"
git push

echo "Published: ${SLUG} → electricsheep.27b.io/dreams/${SLUG}/"
