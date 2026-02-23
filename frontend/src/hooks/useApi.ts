export async function apiFetch<T>(path: string, projectId?: string, options?: RequestInit): Promise<T> {
  // If projectId is provided, rewrite /api/... -> /api/projects/{projectId}/...
  let resolvedPath = path;
  if (projectId && path.startsWith('/api/')) {
    resolvedPath = `/api/projects/${projectId}/${path.slice('/api/'.length)}`;
  }

  const response = await fetch(resolvedPath, options);

  if (!response.ok) {
    throw new Error(`API ${resolvedPath} failed: ${response.status}`);
  }

  return response.json();
}
