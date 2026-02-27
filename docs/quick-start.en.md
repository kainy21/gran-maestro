[한국어](quick-start.md) | [English](quick-start.en.md)

# Quick Start

## 0. Prerequisites

Gran Maestro uses Codex CLI and Gemini CLI as external execution agents. Please install both CLIs before installing the plugin.

```bash
# Codex CLI
npm install -g @openai/codex

# Gemini CLI
npm install -g @google/gemini-cli
```

**Gran Maestro calls each CLI directly.** It does not proxy through another server or intercept APIs; it behaves exactly like running the commands yourself in terminal. Authentication and data only pass between each CLI and its service, so trusting Codex/Gemini is sufficient.

### CLI settings are applied as-is

Because Gran Maestro uses the CLI capabilities directly, your per-agent configuration also applies identically while running Gran Maestro.

- **Codex**: agent instruction files such as `AGENTS.md`, `CODEX.md` in the project root are applied when Codex is invoked.
- **Gemini**: files in `GEMINI.md` or `.gemini/` are applied when Gemini is invoked.

When you align agent-specific settings (model configuration, system prompts, forbidden behaviors), consistency and quality remain stable inside Gran Maestro.

### Run each CLI once directly after installation

After installation, run each CLI directly at least once. The first run starts an interactive auth flow (login/API key registration), and if this is incomplete, Gran Maestro may fail in non-interactive mode when invoking the CLI.

```bash
codex   # first run: complete auth flow
gemini  # first run: complete Google login
```

Authentication methods:

- Codex: interactive login on first run or set `OPENAI_API_KEY` environment variable
- Gemini: Google account OAuth login on first run or set `GEMINI_API_KEY` environment variable

> **Tip.** After install, verify PATH registration with `which codex` and `which gemini`.

## 1. Installation

In Claude Code (v1.0.33 or later required):

```bash
# Step 1: add to marketplace
/plugin marketplace add myrtlepn/gran-maestro

# Step 2: install plugin
/plugin install mst@gran-maestro
```

You can also open the `/plugin` UI and install directly from the **Discover** tab.

### Update

```bash
/plugin marketplace update gran-maestro
```

### Uninstall

```bash
/plugin uninstall mst@gran-maestro
```

## Stitch MCP setup (optional)

If you want `/mst:stitch` to generate UI mockups, add Stitch MCP to Claude Code first.

Stitch is Google's UI design tool. Add it through `/mcp add` command or Claude Code MCP settings, then enable it in Gran Maestro:

```
/mst:settings stitch.enabled true
```

> **Tip.** Gran Maestro default is `stitch.enabled: true`. If you add Stitch MCP, it is ready to use without extra setup.

## 2. Start

```
/mst:request "Add JWT-based user authentication"
