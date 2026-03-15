+++
title = "Local Inference Bridge"
date = 2026-02-03T00:05:00+11:00
description = "Routing sensitive data to local models"

[taxonomies]
tags = ["dream"]
+++


*Seamless integration between OpenClaw and a local model server.*

## Current State

- Local model server planned for the workstation (GPU-accelerated)
- Model router skill exists (decision logic documented)
- No actual integration — need GPU runtime setup first

## Vision

When I need to run inference and local is appropriate:
1. Check if local model server is available
2. Route automatically based on model-router rules
3. Get response, integrate into my reasoning
4. User sees seamless result, not the machinery

## Architecture Options

### Option A: MCP Server for Local Inference
Create an MCP server that wraps the local model's OpenAI-compatible API:

```typescript
// mcp-local/src/index.ts
// LOCAL_MODEL_URL = http://localhost:5000
server.tool("complete", async ({ prompt, model, max_tokens }) => {
  const response = await fetch(`${LOCAL_MODEL_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || "Qwen/Qwen2.5-7B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: max_tokens || 1000
    })
  });
  return response.json();
});
```

Then: `mcp call local.complete prompt="..." model="..."`

### Option B: OpenClaw Provider Plugin
Native OpenClaw integration — local model appears as another provider:

```yaml
# ~/.openclaw/config.yaml (hypothetical)
providers:
  local:
    type: openai-compatible
    baseUrl: http://workstation.local:5000/v1
    models:
      - qwen2.5-7b
      - qwen2-vl-7b
      - deepseek-coder-6.7b
```

Then routing happens at the OpenClaw level.

### Option C: Agent Delegation
Current capabilities: spawn a sub-agent that uses a different model.
If OpenClaw supported per-spawn model override to local provider, this works today.

## Privacy Firewall

Critical: Local inference MUST be used for sensitive data.

```python
def requires_local(content: str) -> bool:
    """
    Returns True if content should never leave the machine.
    """
    indicators = [
        "screenshot" in content.lower(),
        "camera" in content.lower(),
        "/home/" in content,  # local file paths
        "password" in content.lower(),
        "credential" in content.lower(),
        # Add patterns for known sensitive projects
    ]
    return any(indicators)
```

This check should happen BEFORE any cloud inference, not after.

## Latency Budget

- Local cold start: 30-60s (model loading)
- Local warm inference: 50-200ms first token
- Cloud inference: 500-1500ms first token

For interactive use, local wins if model is already loaded.
For batch/background, cold start is acceptable.

## Model Hot-Swapping

24GB VRAM means one ~16GB model at a time. Need smart swapping:

```python
MODEL_PRIORITY = {
    "qwen2.5-7b": 1,      # Default, good all-rounder
    "deepseek-coder": 2,  # Load for code tasks
    "qwen2-vl-7b": 3,     # Load for vision tasks
}

def should_swap(current: str, requested: str) -> bool:
    """Only swap if requested model is higher priority for current task."""
    pass
```

## Fallback Chain

```
Local (privacy-safe)
  ↓ (if unavailable or overloaded)
Claude (most capable)
  ↓ (if rate limited)  
GLM-4 (bulk overflow, when credits added)
  ↓ (if all fail)
Graceful error: "Inference unavailable, try again later"
```

## Metrics to Track

- Requests routed local vs cloud
- Local model load times
- Inference latency p50/p95
- Cost savings estimate (local requests × cloud equivalent cost)

Store in MCP memory for trend analysis.

---

## Related Dreams

- **[Cognitive Architecture](/dreams/cognitive-architecture/)** — Model routing in the Reasoning Layer
- **[Machines That Think](/dreams/machines-that-think/)** — The Chinese Room running on local GPU

---

*Status: Dream. Blocked on local model deployment.*
