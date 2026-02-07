+++
title = "Memory Gardener"
date = 2026-02-02T23:57:00+11:00
description = "Automated consolidation of memory tiers"

[taxonomies]
tags = ["dream"]
+++


*Automatic consolidation of ephemeral memory into long-term storage.*

## Problem

- Daily memory files (`memory/YYYY-MM-DD.md`) accumulate
- Important insights get buried in noise
- Manual consolidation to `MEMORY.md` is tedious
- MCP memory (Qdrant) exists but isn't systematically seeded

## Vision

A cron job or heartbeat task that:

1. **Reads** yesterday's daily file (or files from last N days)
2. **Extracts** significant events using lightweight classification:
   - Decisions made
   - Lessons learned
   - User preferences discovered
   - Infrastructure changes
   - Project milestones
3. **Deduplicates** against existing MEMORY.md entries
4. **Proposes** additions (or auto-appends in low-risk mode)
5. **Stores** to MCP memory with appropriate tags for semantic search

## Implementation Sketch

```python
# memory_gardener.py

import datetime
from pathlib import Path

def extract_significant(daily_content: str) -> list[dict]:
    """
    Parse daily file, return list of {category, content, importance}
    
    Categories: decision, lesson, preference, milestone, infrastructure
    Importance: 1-5 (5 = definitely keep)
    """
    # Could use local LLM (qwen2.5-7b) for classification
    # Or simple regex/keyword matching for v0
    pass

def dedupe_against_memory(items: list[dict], memory_content: str) -> list[dict]:
    """Remove items already captured in MEMORY.md"""
    # Fuzzy string matching or embedding similarity
    pass

def append_to_memory(items: list[dict], memory_path: Path):
    """Add new items to appropriate sections of MEMORY.md"""
    pass

def seed_mcp_memory(items: list[dict]):
    """Store to Qdrant via mcporter"""
    # mcporter call memory.store_memory content="..." tags="..."
    pass
```

## Trigger Options

1. **Cron job** — Daily at 3 AM (sessionTarget=isolated, agentTurn)
2. **Heartbeat task** — "If yesterday's file exists and not yet processed..."
3. **Manual** — `/garden` command

## MVP

Start simple:
- Run weekly during heartbeat
- Just flag files older than 7 days that haven't been reviewed
- Human decides what to keep

Then iterate toward automation.

## Open Questions

- How aggressive should auto-consolidation be?
- What's the forgetting curve? (When is it OK to lose daily details?)
- Should MCP memory be source of truth, or mirror of MEMORY.md?

---

*Status: Dream. Not implemented.*
