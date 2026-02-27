[한국어](best-practices.md) | [English](best-practices.en.md)

# Gran Maestro — Best Practices

This document summarizes recommended usage patterns to make Gran Maestro more effective.

---

## Core flow: single request mode

Use this for immediate start and real-time tracking when only one request is involved.

```
# 1. Start request immediately (PM analysis -> spec writing -> automatic execution)
/mst:request Improve login screen

# 2. Accept result after execution
/mst:approve
```

**When to use:**
- Scope is clear and only one request exists
- You want to proceed while checking output in real time
- You want to refine spec through interactive conversation while working

---

## Best practice: batch approve after planning

Collect multiple requests as plans first, then review and run them together.
This is strongest when you want to start parallel tasks before stepping away.

```
# 1. Expand multiple requests into plans (spec generation)
/mst:plan Improve login screen
/mst:plan Add API endpoint
/mst:plan Fix dashboard bug

# 2. Review the generated spec list
/mst:list

# 3. Approve in batch after review (sample IDs)
/mst:approve PLN-001 PLN-002 PLN-003
```

**When to use:**
- You want to handle multiple requests at once
- You want to prepare specs before starting
- You want to start several tasks in parallel before leaving your seat
- You want to review and adjust each spec before one-shot approval

**Benefits:**
- You can start execution after sufficient spec review
- Multiple tasks run in parallel, reducing total elapsed time
- Easier to resize scope or cancel before execution starts

---

## Single request vs batch decision

| Situation | Recommended approach |
|------|------|
| One request, can start immediately | `/mst:request` single request |
| Two or more requests, preplanned | `/mst:plan` + batch approve |
| Scope is unclear | use `/mst:plan` first for Q&A refinement |
| Complex work requiring decomposition | use split execution in `/mst:plan` |
| You expect to leave | `/mst:plan` × N -> batch approve -> leave |
| Debug investigation needed first | `/mst:debug` -> check report -> `/mst:plan` |

**Core decision rule:**
- If scope is clear and you want to start now, use `/mst:request` single mode.
- If scope is uncertain or multiple tasks are prepared, start with `/mst:plan`.

---

## Parallel execution optimization

Gran Maestro automatically runs independent tasks in parallel. You can raise throughput by tuning settings.

### Tune parallel slot count

```
# raise from default(5) to run more tasks concurrently
/mst:settings concurrency.max_parallel_tasks 8
```

| Setting key | Description | Default |
|---------|------|--------|
| `concurrency.max_parallel_tasks` | maximum number of tasks that can run at once | 5 |

### How parallel execution works

- **Independent REQ**: automatically runs in parallel when there is no `blockedBy` dependency
- **Dependent REQ**: if `blockedBy` specifies predecessors, it activates automatically after completion
- **When slots are exceeded**: remaining tasks wait in `queued` until a slot becomes available

### Dependency example when writing plan

```
/mst:plan Change DB schema -> Add API endpoint -> Implement UI screen
```

Dependent chains set `blockedBy` automatically in `/mst:plan`.
When order matters, express explicitly like "A after B".

---

## Request splitting criteria

Splitting a large request into multiple REQs improves parallel execution, independent review, and partial rollback.

### Split when appropriate

| Situation | Reason | Split method |
|------|------|--------|
| Mixed domains (backend + frontend) | each can be tested and deployed independently | split by domain |
| Order dependency exists (DB change -> API -> UI) | subsequent tasks must start after predecessors | split and set `blockedBy` |
| independently testable and deployable | parallel execution shortens time | split into separate REQ |
| one task is too large | prevents timeouts and improves review quality | split by functional units |

### When not to split

- Few file changes focused on one feature
- Context becomes fragmented and quality may drop when split
- atomic change is required (breaking if not changed together)

### Using batch split in plan

When writing `/mst:plan`, use the `## 분리 실행` section so PM Conductor creates multiple REQs with appropriate `blockedBy` automatically.

---

## Common patterns

### Pattern 1: pre-merge batch run before leaving

Prepare and start multiple tasks before leaving your desk.

```
# Split tasks into plans
/mst:plan Improve login screen
/mst:plan Add API endpoint
/mst:plan Fix notification bug

# Review specs
/mst:list

# Start batch run (sample IDs — check real IDs in /mst:list)
/mst:approve PLN-001 PLN-002 PLN-003

# Leave the desk while running in parallel
# Check results after you return
/mst:list
```

### Pattern 2: debug-first investigation before implementation

Understand root cause first, then plan implementation from the findings.

```
# 1. Investigate bug cause
/mst:debug Dashboard data resets when refreshes

# 2. Review report (DBG-NNN is a sample ID)
/mst:inspect DBG-NNN

# 3. Create implementation plan based on debug report
/mst:plan --from-debug DBG-NNN

# 4. Approve and run
/mst:approve
```

**Effect:** starting implementation before root-cause analysis risks fixing the wrong area.
If you write the plan based on the debug report, the fix scope becomes accurate.

### Pattern 3: validate idea before implementation

Collect multiple AI opinions before starting a new feature to confirm direction.

```
# 1. Collect ideas from multiple agents
/mst:ideation How should real-time collaborative editing be implemented?

# 2. Review synthesized opinions and choose direction

# 3. Create implementation plan with chosen direction
/mst:plan Implement real-time collaborative editing (WebSocket-based)

# 4. Approve and execute
/mst:approve
```

**Effect:** Without direction confirmation, implementation may require large refactors later.
Pre-validation with `/mst:ideation` lets implementation start after technical direction is fixed.

### Pattern 4: split complex feature into stages

Break a large feature into multiple phases and implement gradually.

```
# specify split execution in plan
/mst:plan OAuth social login full implementation
# -> PM Conductor auto-splits:
#   REQ-NNN-01: Add DB schema (users.oauth_provider)
#   REQ-NNN-02: Implement backend OAuth handler (blockedBy: NNN-01)
#   REQ-NNN-03: Frontend social login UI (blockedBy: NNN-02)

# Check split tasks
/mst:list

# Batch approve; runs in dependency order automatically
/mst:approve REQ-NNN-01 REQ-NNN-02 REQ-NNN-03
```

**Effect:** Each phase can be reviewed and adjusted independently, improving quality.
DB changes finish first, then API starts, avoiding unnecessary rework.

### Pattern 5: recover after session interruption

Recover when Claude Code session is closed or workflow is interrupted.

```
# Check pending requests
/mst:recover

# Recover a specific request (sample ID)
/mst:recover REQ-042

# Check current status after recovery
/mst:list
```

---

## Configuration tips

### Key config options

```
# adjust parallel execution slots
/mst:settings concurrency.max_parallel_tasks 8

# adjust max feedback iterations (default 5)
/mst:settings feedback.max_iterations 3

# auto deactivate Maestro mode after all REQ are done
/mst:settings auto_deactivate true

# enable debug logging
/mst:settings debug.enabled true
/mst:settings debug.log_level debug
```

### Check current settings

```
/mst:settings
```

---

## Related documents

- [Glossary](glossary.en.md) — official terminology and phase definitions
- [CLAUDE.md](CLAUDE.md) — plugin worldview and skill references
