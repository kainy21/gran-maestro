[한국어](omx-guide.md) | [English](omx-guide.en.md)

# OMX (oh-my-codex)

> The orchestration layer that turns Codex CLI from a single agent into a team system

## Why OMX?

- **Role-based specialist agents**: Automatically routes to specialist prompt patterns like `/prompts:architect`, `/prompts:planner`, `/prompts:executor` based on request intent for better response quality.
- **Workflow skill automation**: Executes repetitive work patterns instantly with one-word triggers like `$analyze`, `$code-review`, `$ultrawork`.
- **Team mode — parallel multi-agent**: Use `omx team` to run multiple workers in parallel for large refactors and multi-module tasks.
- **Persistent state management**: Preserves runtime state and memory in `.omx/`, maintaining context through long sessions.

## Using with Gran Maestro

- Gran Maestro spec creation -> Codex CLI execution -> OMX auto role routing are linked so the optimal agent is selected at each phase.
- Inject project-specific rules with `AGENTS.md` and auto-switch based on intent even without explicit triggers.
- One `/mst:setup-omx` command completes install, initialization, and `AGENTS.md` injection.

## Official links

- **GitHub**: [Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) — full features, skill triggers, team mode references
- **npm**: [oh-my-codex](https://www.npmjs.com/package/oh-my-codex) — installation and release info

## Start with Gran Maestro

```
/mst:setup-omx
```
