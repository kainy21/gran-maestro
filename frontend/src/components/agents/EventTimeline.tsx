import { useState, useMemo } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search } from 'lucide-react';
import type { AgentEvent } from '../../hooks/useAgents';

interface EventTimelineProps {
  events: AgentEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const lowerSearch = search.toLowerCase();
    return events.filter((e) => {
      const toolName = (e.payload?.tool_name as string) || '';
      return (
        e.source_app.toLowerCase().includes(lowerSearch) ||
        e.session_id.toLowerCase().includes(lowerSearch) ||
        e.hook_event_type.toLowerCase().includes(lowerSearch) ||
        toolName.toLowerCase().includes(lowerSearch)
      );
    });
  }, [events, search]);

  return (
    <div className="flex flex-col h-full border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-2">Event Timeline</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by app, session, event type, tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No events found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-1 p-3 rounded-lg border bg-muted/20 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{event.source_app}</Badge>
                    <span className="font-semibold text-primary">{event.hook_event_type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1 truncate" title={event.session_id}>
                  Session: {event.session_id}
                </div>
                
                {event.payload && Object.keys(event.payload).length > 0 && (
                  <div className="mt-2 bg-muted/50 p-2 rounded text-xs font-mono overflow-x-auto">
                    {typeof event.payload.tool_name === 'string' && (
                      <div className="text-blue-500 dark:text-blue-400 font-semibold mb-1">
                        Tool: {event.payload.tool_name}
                      </div>
                    )}
                    <pre className="text-muted-foreground whitespace-pre-wrap break-all">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
