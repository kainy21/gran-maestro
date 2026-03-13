import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from './useApi';

export type AgentStatus = 'WORKING' | 'THINKING' | 'READING' | 'DONE' | 'WAITING' | 'OFFLINE' | 'BLOCKED' | 'ORCHESTRATING';

export interface AgentState {
  status: AgentStatus;
  lastEvent: string;
  lastUpdated: number;
  characterId: string;
  subagentCount: number;
  isSubagent: boolean;
  description?: string;
}

export interface AgentEvent {
  id: string;
  source_app: string;
  session_id: string;
  hook_event_type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface ThemeRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  files: string[];
}

export interface ThemesResponse {
  activeThemeId: string | null;
  themes: ThemeRecord[];
}

export function useAgents() {
  const { projectId, lastSseEvent } = useAppContext();
  const [agents, setAgents] = useState<Record<string, AgentState>>({});
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [themesData, setThemesData] = useState<ThemesResponse>({ activeThemeId: null, themes: [] });
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [agentsData, eventsData, themesResp] = await Promise.all([
        apiFetch<Record<string, AgentState>>('/api/agents', projectId),
        apiFetch<AgentEvent[]>('/api/agents/events?limit=300', projectId),
        apiFetch<ThemesResponse>('/api/agents/themes', projectId),
      ]);
      setAgents(agentsData);
      setEvents(eventsData);
      setThemesData(themesResp);
    } catch (err) {
      console.error('Failed to fetch agents data', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Handle SSE
  useEffect(() => {
    if (!lastSseEvent) return;

    const { type, data } = lastSseEvent;

    if (type === 'agent_states') {
      setAgents(data);
    } else if (type === 'agent_event') {
      setEvents(prev => {
        const newEvents = [data as AgentEvent, ...prev];
        return newEvents.slice(0, 300); // keep max 300
      });
    } else if (type && type.startsWith('agent_theme_')) {
      // Re-fetch themes if theme changes
      apiFetch<ThemesResponse>('/api/agents/themes', projectId)
        .then(setThemesData)
        .catch(console.error);
    }
  }, [lastSseEvent, projectId]);

  return { agents, events, themesData, setThemesData, loading, refetch: fetchAll };
}
