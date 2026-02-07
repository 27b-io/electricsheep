+++
title = "Wake Patterns"
date = 2026-02-02T23:57:30+11:00
description = "Proactive behaviours and morning briefings"

[taxonomies]
tags = ["dream"]
+++


*Proactive behaviors that run without being asked.*

## Philosophy

An assistant that only speaks when spoken to is a search engine with a personality.
The good ones anticipate.

But: there's a line between helpful and annoying. Stay on the right side.

## Pattern Library

### 1. Morning Brief
**Trigger:** First interaction after 6 AM local time (or cron at 7 AM)
**Action:** 
- Weather for today
- Calendar events in next 12h
- Unread emails flagged important
- Any overnight alerts from monitored systems

**Anti-pattern:** Don't repeat if already delivered. Track in heartbeat-state.json.

### 2. Context Resurrector  
**Trigger:** Session start with no recent activity (>4h gap)
**Action:**
- Read yesterday's memory file
- Summarize: "Last we spoke, you were working on X. Status?"

**Anti-pattern:** Don't do this if user clearly starting fresh task.

### 3. Deadline Whisperer
**Trigger:** Heartbeat check finds calendar event <2h away
**Action:** Gentle reminder with relevant context
**Anti-pattern:** Not during silent hours. Not for events marked "Focus time".

### 4. Infrastructure Watchdog
**Trigger:** Periodic (every 4h during active hours)
**Action:**
- Check lab disk pressure
- Check if vLLM is responding (when deployed)
- Check Plex transcoding queue
- Only alert if anomaly found

**Anti-pattern:** Don't cry wolf. Thresholds should be meaningful.

### 5. Research Digest
**Trigger:** Weekly (Sunday evening)
**Action:**
- Summarize GitHub activity on watched repos
- New papers in areas of interest (via arxiv API or perplexity)
- Changelog summaries for key tools

**Anti-pattern:** Keep it SHORT. Bullet points, not essays.

### 6. Memory Maintenance
**Trigger:** Weekly during low-activity period
**Action:**
- Review daily files from past week
- Propose MEMORY.md updates
- Clean up stale heartbeat state

**Anti-pattern:** Don't auto-modify without permission (at first).

## Implementation Notes

Most of these fit into HEARTBEAT.md as checklist items:
```markdown
- [ ] Morning brief (if first session today and hour > 6)
- [ ] Check lab health (if lastChecks.lab > 4h ago)
- [ ] Deadline check (if calendar events within 2h)
```

Some need cron for precision (exact times, isolated sessions).

## Trust Ladder

Start conservative:
1. **Level 0:** Only do when explicitly asked
2. **Level 1:** Suggest actions, wait for approval
3. **Level 2:** Act, but always report what was done
4. **Level 3:** Act silently for routine, report anomalies only

Climb the ladder as trust is earned. User can always dial back.

---

*Status: Dream. Patterns not yet active.*
