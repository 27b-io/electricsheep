#!/bin/bash
# Validate Zola +++ frontmatter on staged content files
# Used by prek (pre-commit) — receives filenames as arguments

set -euo pipefail

errors=0

for file in "$@"; do
    [[ "$file" == *"_index.md" ]] && continue
    [[ ! -f "$file" ]] && continue

    # Must start with +++
    if ! head -1 "$file" | grep -q '^\+\+\+$'; then
        echo "FAIL ${file}: missing +++ frontmatter"
        errors=$((errors + 1))
        continue
    fi

    # Extract frontmatter between first and second +++
    fm=$(awk '/^\+\+\+$/{n++; next} n==1{print} n>=2{exit}' "$file")

    # Required: title
    if ! echo "$fm" | grep -q '^title = '; then
        echo "FAIL ${file}: missing 'title'"
        errors=$((errors + 1))
    fi

    # Required: date
    if ! echo "$fm" | grep -q '^date = '; then
        echo "FAIL ${file}: missing 'date'"
        errors=$((errors + 1))
    fi

    # Required: tags taxonomy
    if ! echo "$fm" | grep -q 'tags = \['; then
        echo "FAIL ${file}: missing tags taxonomy"
        errors=$((errors + 1))
    fi

    # Date format check
    date_val=$(echo "$fm" | grep '^date = ' | sed 's/^date = //')
    if [[ -n "$date_val" ]] && ! echo "$date_val" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}'; then
        echo "FAIL ${file}: bad date format '${date_val}' — expected YYYY-MM-DDTHH:MM:SS+HH:00"
        errors=$((errors + 1))
    fi
done

[[ $errors -gt 0 ]] && exit 1
exit 0
