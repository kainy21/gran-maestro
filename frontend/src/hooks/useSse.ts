import { useState, useEffect, useCallback } from 'react';

export type SSEStatus = 'connected' | 'disconnected' | 'connecting';

export function useSse(token: string, onEvent: (event: any) => void) {
  const [status, setStatus] = useState<SSEStatus>('disconnected');

  const connect = useCallback(() => {
    if (!token) return;

    setStatus('connecting');
    const url = `/events?token=${token}`;
    const es = new EventSource(url);

    es.onopen = () => {
      setStatus('connected');
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    es.onerror = () => {
      setStatus('disconnected');
      es.close();
      // Auto-reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    return es;
  }, [token, onEvent]);

  useEffect(() => {
    const es = connect();
    return () => {
      if (es) es.close();
    };
  }, [connect]);

  return { status };
}
