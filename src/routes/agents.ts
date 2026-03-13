import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.224.0/path/mod.ts";

import { loadConfig, resolveBaseDir } from "../config.ts";
import { broadcastUpdate } from "../sse.ts";

const agentsApi = new Hono();

type AgentStatus =
  | "WORKING"
  | "THINKING"
  | "READING"
  | "DONE"
  | "WAITING"
  | "OFFLINE"
  | "BLOCKED"
  | "ORCHESTRATING";

interface AgentState {
  status: AgentStatus;
  lastEvent: string;
  lastUpdated: number;
  characterId: string;
  subagentCount: number;
  isSubagent: boolean;
  description?: string;
}

interface AgentEvent {
  id: string;
  source_app: string;
  session_id: string;
  hook_event_type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

interface ThemeRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  files: string[];
}

const READING_TOOLS = new Set([
  "Grep",
  "Glob",
  "WebSearch",
  "WebFetch",
  "ToolSearch",
]);
const AGENT_FIRST_EVENTS = new Set(["UserPromptSubmit", "SessionStart"]);
const NON_WAITING_TIMEOUT_EXCEPTIONS = new Set([
  "WAITING",
  "DONE",
  "ORCHESTRATING",
  "BLOCKED",
]);
const BUILTIN_CHARACTER_IDS = ["frieren", "fern", "stark", "himmel"];

const agentStates = new Map<string, AgentState>();
const pendingTaskQueues = new Map<string, string[]>();
let characterCounter = 0;
let taskCounter = 0;

const routesDir = dirname(fromFileUrl(import.meta.url));
const projectRoot = join(routesDir, "..", "..");
const uploadsSpritesDir = join(projectRoot, "uploads", "sprites");

const kvPromise = Deno.openKv();

function keyScope(projectId?: string): string {
  return projectId ? `project:${projectId}` : "project:default";
}

function sanitizeId(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

function sanitizeFileName(input: string): string {
  const normalized = input.replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized.length > 0 ? normalized : `${crypto.randomUUID()}.gif`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOrAssignCharacter(agentKey: string): string {
  const existing = agentStates.get(agentKey);
  if (existing) return existing.characterId;
  const characterId = BUILTIN_CHARACTER_IDS[characterCounter % BUILTIN_CHARACTER_IDS.length] ?? "frieren";
  characterCounter += 1;
  return characterId;
}

function eventToStatus(eventType: string, payload: Record<string, unknown>): AgentStatus {
  if (eventType === "PreToolUse" && typeof payload.tool_name === "string" && READING_TOOLS.has(payload.tool_name)) {
    return "READING";
  }
  const map: Record<string, AgentStatus> = {
    PreToolUse: "WORKING",
    PostToolUse: "WORKING",
    UserPromptSubmit: "THINKING",
    SessionStart: "THINKING",
    Stop: "DONE",
    PermissionRequest: "BLOCKED",
    Notification: "WAITING",
    SessionEnd: "OFFLINE",
    SubagentStart: "ORCHESTRATING",
  };
  return map[eventType] ?? "WAITING";
}

function broadcastAgentStates(projectId?: string): void {
  const data = Object.fromEntries(agentStates.entries());
  broadcastUpdate({
    type: "agent_states",
    projectId,
    data,
  });
}

function updateAgentState(
  sourceApp: string,
  sessionId: string,
  eventType: string,
  payload: Record<string, unknown>,
  projectId?: string,
): void {
  const sessionPrefix = sessionId.slice(0, 8);
  const agentKey = `${sourceApp}:${sessionPrefix}`;
  const existing = agentStates.get(agentKey);

  if (eventType === "SubagentStart") {
    if (existing) {
      agentStates.set(agentKey, {
        ...existing,
        status: "ORCHESTRATING",
        lastEvent: eventType,
        lastUpdated: Date.now(),
        subagentCount: existing.subagentCount + 1,
      });

      const taskKey = `${agentKey}~task${++taskCounter}`;
      agentStates.set(taskKey, {
        status: "WORKING",
        lastEvent: "SubagentStart",
        lastUpdated: Date.now(),
        characterId: "",
        subagentCount: 0,
        isSubagent: true,
        description: typeof payload.description === "string" ? payload.description : undefined,
      });

      if (!pendingTaskQueues.has(agentKey)) {
        pendingTaskQueues.set(agentKey, []);
      }
      pendingTaskQueues.get(agentKey)?.push(taskKey);
    }
    broadcastAgentStates(projectId);
    return;
  }

  if (eventType === "SubagentStop") {
    if (existing) {
      const nextCount = Math.max(0, existing.subagentCount - 1);
      agentStates.set(agentKey, {
        ...existing,
        status: nextCount > 0 ? "ORCHESTRATING" : "DONE",
        lastEvent: eventType,
        lastUpdated: Date.now(),
        subagentCount: nextCount,
      });

      const queue = pendingTaskQueues.get(agentKey);
      if (queue && queue.length > 0) {
        const taskKey = queue.shift();
        if (taskKey) {
          const taskState = agentStates.get(taskKey);
          if (taskState) {
            agentStates.set(taskKey, {
              ...taskState,
              status: "DONE",
              lastEvent: "SubagentStop",
              lastUpdated: Date.now(),
            });
          }
        }
        if (queue.length === 0) {
          pendingTaskQueues.delete(agentKey);
        }
      }
    }
    broadcastAgentStates(projectId);
    return;
  }

  let isSubagent: boolean;
  if (AGENT_FIRST_EVENTS.has(eventType)) {
    isSubagent = false;
  } else {
    isSubagent = existing?.isSubagent ?? !AGENT_FIRST_EVENTS.has(eventType);
  }

  const status = eventToStatus(eventType, payload);
  const characterId = getOrAssignCharacter(agentKey);
  agentStates.set(agentKey, {
    status,
    lastEvent: eventType,
    lastUpdated: Date.now(),
    characterId,
    subagentCount: existing?.subagentCount ?? 0,
    isSubagent,
  });

  broadcastAgentStates(projectId);
}

function applyTimeoutTransitions(): void {
  const now = Date.now();
  let changed = false;

  for (const [key, state] of agentStates.entries()) {
    const elapsed = now - state.lastUpdated;

    if (state.isSubagent) {
      if (state.status === "DONE" && elapsed > 5 * 60 * 1000) {
        agentStates.delete(key);
        changed = true;
      }
      continue;
    }

    if (elapsed > 5 * 60 * 1000 && state.status !== "OFFLINE") {
      agentStates.set(key, { ...state, status: "OFFLINE", subagentCount: 0 });
      changed = true;
      continue;
    }

    if (state.status === "DONE" && elapsed > 30 * 1000) {
      agentStates.set(key, { ...state, status: "WAITING" });
      changed = true;
      continue;
    }

    if (elapsed > 60 * 1000 && !NON_WAITING_TIMEOUT_EXCEPTIONS.has(state.status)) {
      agentStates.set(key, { ...state, status: "WAITING" });
      changed = true;
    }
  }

  if (changed) {
    broadcastAgentStates();
  }
}

setInterval(() => {
  applyTimeoutTransitions();
}, 10_000);

function parseRetentionToMs(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim().length === 0) return 7 * 24 * 60 * 60 * 1000;
  const normalized = value.trim().toLowerCase();

  if (normalized === "permanent") return undefined;
  if (normalized === "phase") return 7 * 24 * 60 * 60 * 1000;

  const match = normalized.match(/^(\d+)([smhdw])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  return amount * unitMs[unit];
}

async function getRetentionMs(baseDir?: string): Promise<number | undefined> {
  try {
    const config = await loadConfig(baseDir);
    const agentsConfig = isObject(config.agents) ? config.agents : undefined;
    return parseRetentionToMs(agentsConfig?.event_retention);
  } catch {
    return parseRetentionToMs(undefined);
  }
}

function kvSetOptions(retentionMs?: number): { expireIn?: number } {
  return retentionMs ? { expireIn: retentionMs } : {};
}

async function persistEvent(
  scope: string,
  event: AgentEvent,
  retentionMs?: number,
): Promise<void> {
  const kv = await kvPromise;
  const options = kvSetOptions(retentionMs);
  await kv.set(["agents", scope, "events", "byId", event.id], event, options);
  await kv.set(["agents", scope, "events", "timeline", event.timestamp, event.id], event.id, options);
}

async function listRecentEvents(scope: string, limit: number): Promise<AgentEvent[]> {
  const kv = await kvPromise;
  const timeline: string[] = [];
  for await (const entry of kv.list<string>({ prefix: ["agents", scope, "events", "timeline"] }, {
    reverse: true,
    limit,
  })) {
    if (typeof entry.value === "string") {
      timeline.push(entry.value);
    }
  }

  const events: AgentEvent[] = [];
  for (const id of timeline) {
    const event = await kv.get<AgentEvent>(["agents", scope, "events", "byId", id]);
    if (event.value) {
      events.push(event.value);
    }
  }
  return events;
}

async function getThemes(scope: string): Promise<ThemeRecord[]> {
  const kv = await kvPromise;
  const themes: ThemeRecord[] = [];
  for await (const entry of kv.list<ThemeRecord>({ prefix: ["agents", scope, "themes", "byId"] })) {
    if (entry.value) {
      themes.push(entry.value);
    }
  }
  themes.sort((a, b) => b.updatedAt - a.updatedAt);
  return themes;
}

async function setTheme(scope: string, theme: ThemeRecord): Promise<void> {
  const kv = await kvPromise;
  await kv.set(["agents", scope, "themes", "byId", theme.id], theme);
}

async function getTheme(scope: string, themeId: string): Promise<ThemeRecord | null> {
  const kv = await kvPromise;
  const row = await kv.get<ThemeRecord>(["agents", scope, "themes", "byId", themeId]);
  return row.value ?? null;
}

async function deleteTheme(scope: string, themeId: string): Promise<void> {
  const kv = await kvPromise;
  await kv.delete(["agents", scope, "themes", "byId", themeId]);
}

async function getActiveThemeId(scope: string): Promise<string | null> {
  const kv = await kvPromise;
  const row = await kv.get<string>(["agents", scope, "themes", "active"]);
  return row.value ?? null;
}

async function setActiveThemeId(scope: string, themeId: string | null): Promise<void> {
  const kv = await kvPromise;
  await kv.set(["agents", scope, "themes", "active"], themeId ?? "");
}

function normalizeIncomingEvent(body: unknown): {
  sourceApp: string;
  sessionId: string;
  eventType: string;
  payload: Record<string, unknown>;
} | null {
  if (!isObject(body)) return null;

  const sourceApp = typeof body.source_app === "string" ? body.source_app : "unknown";
  const sessionId = typeof body.session_id === "string" ? body.session_id : "";
  const eventType = typeof body.event_type === "string"
    ? body.event_type
    : (typeof body.hook_event_type === "string" ? body.hook_event_type : "");

  if (!sessionId || !eventType) return null;

  const payload = isObject(body.payload) ? { ...body.payload } : {};
  if (typeof body.tool_name === "string" && payload.tool_name === undefined) {
    payload.tool_name = body.tool_name;
  }
  if (typeof body.notification_type === "string" && payload.notification_type === undefined) {
    payload.notification_type = body.notification_type;
  }

  return { sourceApp, sessionId, eventType, payload };
}

agentsApi.post("/events", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const normalized = normalizeIncomingEvent(body);
  if (!normalized) {
    return c.json({ error: "Missing required fields: source_app, session_id, event_type|hook_event_type" }, 400);
  }

  const projectId = c.req.param("projectId");
  const scope = keyScope(projectId);
  const baseDir = resolveBaseDir(projectId);
  const event: AgentEvent = {
    id: crypto.randomUUID(),
    source_app: normalized.sourceApp,
    session_id: normalized.sessionId,
    hook_event_type: normalized.eventType,
    payload: normalized.payload,
    timestamp: Date.now(),
  };

  updateAgentState(
    normalized.sourceApp,
    normalized.sessionId,
    normalized.eventType,
    normalized.payload,
    projectId,
  );

  try {
    const retentionMs = await getRetentionMs(baseDir ?? undefined);
    await persistEvent(scope, event, retentionMs);
  } catch {
    // KV failure must not block main APIs
  }

  broadcastUpdate({
    type: "agent_event",
    projectId,
    data: event,
  });

  return c.json(event);
});

agentsApi.get("/", (c) => {
  return c.json(Object.fromEntries(agentStates.entries()));
});

agentsApi.get("/events", async (c) => {
  const projectId = c.req.param("projectId");
  const scope = keyScope(projectId);
  const limitParam = Number.parseInt(c.req.query("limit") ?? "300", 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 1000) : 300;

  try {
    const events = await listRecentEvents(scope, limit);
    return c.json(events);
  } catch {
    return c.json([]);
  }
});

agentsApi.get("/themes", async (c) => {
  const projectId = c.req.param("projectId");
  const scope = keyScope(projectId);

  try {
    const [themes, activeThemeId] = await Promise.all([
      getThemes(scope),
      getActiveThemeId(scope),
    ]);

    return c.json({
      activeThemeId: activeThemeId && activeThemeId.length > 0 ? activeThemeId : null,
      themes,
    });
  } catch {
    return c.json({ activeThemeId: null, themes: [] });
  }
});

agentsApi.post("/themes/upload", async (c) => {
  const projectId = c.req.param("projectId");
  const scope = keyScope(projectId);

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Invalid multipart form data" }, 400);
  }

  const rawThemeId = formData.get("themeId");
  const rawThemeName = formData.get("name");
  const themeId = sanitizeId(typeof rawThemeId === "string" ? rawThemeId : crypto.randomUUID());
  const themeName = typeof rawThemeName === "string" && rawThemeName.trim().length > 0
    ? rawThemeName.trim()
    : themeId;

  const files: File[] = [];
  for (const value of formData.values()) {
    if (value instanceof File && value.name.toLowerCase().endsWith(".gif")) {
      files.push(value);
    }
  }

  if (files.length === 0) {
    return c.json({ error: "At least one GIF file is required" }, 400);
  }

  const themeDir = join(uploadsSpritesDir, themeId);
  try {
    await Deno.mkdir(themeDir, { recursive: true });

    const savedFiles: string[] = [];
    for (const file of files) {
      const fileName = sanitizeFileName(file.name);
      const bytes = new Uint8Array(await file.arrayBuffer());
      await Deno.writeFile(join(themeDir, fileName), bytes);
      savedFiles.push(fileName);
    }

    const now = Date.now();
    const existing = await getTheme(scope, themeId);
    const mergedFiles = Array.from(new Set([...(existing?.files ?? []), ...savedFiles]));

    const theme: ThemeRecord = {
      id: themeId,
      name: themeName,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      files: mergedFiles,
    };
    await setTheme(scope, theme);

    broadcastUpdate({
      type: "agent_theme_uploaded",
      projectId,
      data: { themeId, fileCount: savedFiles.length },
    });

    return c.json({ success: true, theme }, 201);
  } catch {
    return c.json({ error: "Failed to save theme files" }, 500);
  }
});

agentsApi.post("/themes/:id/activate", async (c) => {
  const projectId = c.req.param("projectId");
  const scope = keyScope(projectId);
  const themeId = sanitizeId(c.req.param("id"));

  if (!themeId) {
    return c.json({ error: "Invalid theme id" }, 400);
  }

  const theme = await getTheme(scope, themeId);
  if (!theme) {
    return c.json({ error: "Theme not found" }, 404);
  }

  await setActiveThemeId(scope, themeId);
  broadcastUpdate({
    type: "agent_theme_activated",
    projectId,
    data: { themeId },
  });

  return c.json({ success: true, activeThemeId: themeId });
});

agentsApi.delete("/themes/:id", async (c) => {
  const projectId = c.req.param("projectId");
  const scope = keyScope(projectId);
  const themeId = sanitizeId(c.req.param("id"));

  if (!themeId) {
    return c.json({ error: "Invalid theme id" }, 400);
  }

  const theme = await getTheme(scope, themeId);
  if (!theme) {
    return c.json({ error: "Theme not found" }, 404);
  }

  try {
    await deleteTheme(scope, themeId);
    await Deno.remove(join(uploadsSpritesDir, themeId), { recursive: true });

    const activeThemeId = await getActiveThemeId(scope);
    if (activeThemeId === themeId) {
      await setActiveThemeId(scope, null);
    }

    broadcastUpdate({
      type: "agent_theme_deleted",
      projectId,
      data: { themeId },
    });

    return c.json({ success: true });
  } catch {
    return c.json({ error: "Failed to delete theme" }, 500);
  }
});

export { agentsApi };
