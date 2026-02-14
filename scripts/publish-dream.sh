#!/bin/bash
set -euo pipefail

# Publish a dream from the workspace to Electric Sheep
# Usage: publish-dream.sh <source.md> [slug] [description]
#
# Creates Zola frontmatter, commits, and pushes.
# CI handles deployment to Cloudflare automatically.
# Pre-commit hooks validate frontmatter and build.

SITE_DIR="$HOME/code/27b.io/electricsheep"
DREAMS_DIR="$SITE_DIR/content/dreams"

SRC="${1:?Usage: publish-dream.sh <source.md> [slug] [description]}"
SLUG="${2:-$(basename "$SRC" .md)}"
DESC="${3:-}"

[ -f "$SRC" ] || { echo "File not found: $SRC" >&2; exit 1; }

# Extract title from first heading
TITLE=$(head -5 "$SRC" | grep -m1 '^# ' | sed 's/^# //' | sed 's/^Dream: //')
[ -z "$TITLE" ] && TITLE="$SLUG"

# Date from file mtime
DATE=$(date -r "$SRC" +"%Y-%m-%dT%H:%M:%S+11:00")

DEST="$DREAMS_DIR/${SLUG}.md"

# Write frontmatter + content
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

# Commit and push — pre-commit validates, CI deploys
cd "$SITE_DIR"
git add "$DEST"
git commit -m "dream: ${TITLE}"
git push

echo "Published: ${SLUG} → electricsheep.27b.io/dreams/${SLUG}/"
echo "CI will deploy automatically."
