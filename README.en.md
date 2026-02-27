# Gran Maestro

[한국어](README.md) | [English](README.en.md)

> **"I am the Maestro — I conduct, I don't code."**

**If you decide, the AI team executes.**

When you get an idea, start a conversation with Claude.
Discuss, explore, and complete the plan.
Once the plan is ready, approve once — Codex and Gemini execute.

## Why Gran Maestro?

- **Claude = PM, Codex / Gemini = engineering team** — Claude writes specs and reviews. Codex and Gemini handle actual implementation on Git Worktree.
- **Work continues even when you step away** — approve the spec and step away. When you return, implementation, review, and feedback are already done.
- **Real-time dashboard** — You can see workflow graph, agent streams, and dependency relations at a glance.
- **Maximize subscription value** — Operate paid Claude, Gemini, and Codex tooling in their strongest roles as a team.

![Gran Maestro dashboard — Ideation view](docs/assets/dashboard-ideation.png)

## Main user flow

### Single request mode

Express what you want to build in natural language, review the generated spec, then approve it.

```
/mst:request "Add JWT-based user authentication"
# PM writes the spec. After review and approval:
/mst:approve
# Implementation -> review -> feedback -> merge continues automatically.
/mst:list                # check the current status in terminal
/mst:dashboard           # inspect workflow visually in web dashboard
```

### Best practice: batch approve after planning

```
# 1. Expand multiple requests as plans
/mst:plan Improve login screen
/mst:plan Add API endpoint
/mst:plan Fix dashboard error

# 2. Review specs and start execution in batch
/mst:list
/mst:approve PLN-001 PLN-002 PLN-003
```

## Core features

| Skill | Description |
|------|------|
| `/mst:plan` | Claude PM asks key decisions one by one and co-creates an interactive spec. |
| `/mst:ideation` | Codex, Gemini, and Claude contribute ideas in parallel; PM synthesizes them into one direction. |
| `/mst:discussion` | AI team repeats discussion until consensus is reached, quickly converging on complex technical decisions. |
| `/mst:debug` | Three AIs (Codex, Gemini, Claude) investigate bugs in parallel and produce a consolidated report. |
| `/mst:stitch` | Generate UI mockups and visual drafts instantly via Google Stitch MCP. |
| `/mst:explore` | Autonomously explores the codebase, analyzes files, functions, and dependencies to support spec writing. |

Full skill list: [docs/skills-reference.en.md](docs/skills-reference.en.md)

## Installation

In Claude Code (v1.0.33 or later):

```bash
/plugin marketplace add myrtlepn/gran-maestro
/plugin install mst@gran-maestro
```

Detailed installation guide: [docs/quick-start.en.md](docs/quick-start.en.md)

## Detailed documents

- [Quick Start](docs/quick-start.en.md) — prerequisites, installation, Stitch MCP setup, authentication
- [Configuration](docs/configuration.en.md) — complete `config.json` option reference
- [Skills Reference](docs/skills-reference.en.md) — detailed usage of 29 skills
- [Dashboard](docs/dashboard.en.md) — hub architecture, views, API endpoints
- [Best Practices](docs/best-practices.en.md) — efficient workflow patterns
- [Glossary](docs/glossary.en.md) — official terms and ID system
- [OMX Guide](docs/omx-guide.en.md) — oh-my-codex install, AGENTS.md customization, trigger reference
- [Changelog](CHANGELOG.md) — version history

## License

Source Available License — free to use, but fork and redistribution are not allowed. See [LICENSE](LICENSE) for details.
