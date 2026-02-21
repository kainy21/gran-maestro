import { useState } from 'react';

export function useAuth() {
  const [token] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      sessionStorage.setItem('gm_token', urlToken);
    }
    return urlToken || sessionStorage.getItem('gm_token') || '';
  });

  const [projectId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlProject = params.get('project');
    if (urlProject) {
      sessionStorage.setItem('gm_project', urlProject);
      // Remove query params from URL for cleaner look
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      return urlProject;
    }
    return sessionStorage.getItem('gm_project') || '';
  });

  return { token, projectId };
}
