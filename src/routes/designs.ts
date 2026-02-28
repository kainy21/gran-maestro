import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import type { DesignSession } from "../types.ts";
import { dirExists, listDirs, readJsonFile, readTextFile } from "../utils.ts";
import { resolveBaseDir } from "../config.ts";

const projectDesignsApi = new Hono();

projectDesignsApi.get("/designs", async (c) => {
  const baseDir = resolveBaseDir(c.req.param("projectId"));
  if (!baseDir) {
    return c.json({ error: "Project not found" }, 404);
  }

  const designsDir = `${baseDir}/designs`;
  if (!(await dirExists(designsDir))) {
    return c.json([]);
  }

  const desDirs = (await listDirs(designsDir)).filter((d) => /^DES-/.test(d));
  const results = await Promise.all(
    desDirs.map(async (dir) => {
      const json = await readJsonFile<DesignSession>(`${designsDir}/${dir}/design.json`);
      if (!json) {
        return null;
      }
      return { ...json, id: json.id || dir };
    }),
  );

  const sessions = results.filter((s): s is NonNullable<typeof s> => s !== null);
  sessions.sort((a, b) => {
    const aTime = a.created_at;
    const bTime = b.created_at;
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;
    return bTime.localeCompare(aTime);
  });

  return c.json(sessions);
});

projectDesignsApi.get("/designs/:desId", async (c) => {
  const baseDir = resolveBaseDir(c.req.param("projectId"));
  if (!baseDir) {
    return c.json({ error: "Project not found" }, 404);
  }

  const desId = c.req.param("desId");
  const desDir = `${baseDir}/designs/${desId}`;
  if (!(await dirExists(desDir))) {
    return c.json({ error: "Design not found" }, 404);
  }

  const json = await readJsonFile<DesignSession>(`${desDir}/design.json`);
  if (!json) {
    return c.json({ error: "Design not found" }, 404);
  }

  const screenFiles: string[] = [];
  try {
    for await (const entry of Deno.readDir(desDir)) {
      if (entry.isFile && /^screen-\d+\.md$/.test(entry.name)) {
        screenFiles.push(entry.name);
      }
    }
  } catch (_error) {
    // ignore
  }
  screenFiles.sort();

  return c.json({ ...json, id: json.id || desId, screen_files: screenFiles });
});

projectDesignsApi.get("/designs/:desId/screens/:screenFile", async (c) => {
  const baseDir = resolveBaseDir(c.req.param("projectId"));
  if (!baseDir) {
    return c.json({ error: "Project not found" }, 404);
  }

  const desId = c.req.param("desId");
  const screenFile = c.req.param("screenFile");
  if (!/^screen-\d+\.md$/.test(screenFile)) {
    return c.json({ error: "Invalid screen file" }, 400);
  }

  const content = await readTextFile(`${baseDir}/designs/${desId}/${screenFile}`);
  if (content === null) {
    return c.json({ exists: false, content: null });
  }
  return c.json({ exists: true, content });
});

export { projectDesignsApi };
