import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Zap } from 'lucide-react';
import type { AgentState, AgentStatus } from '../../hooks/useAgents';
import { SpriteRenderer } from './SpriteRenderer';

interface AgentCardProps {
  id: string;
  agent: AgentState;
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  WORKING: 'bg-blue-500 text-white hover:bg-blue-600',
  ORCHESTRATING: 'bg-purple-500 text-white hover:bg-purple-600',
  THINKING: 'bg-yellow-500 text-white hover:bg-yellow-600',
  READING: 'bg-cyan-500 text-white hover:bg-cyan-600',
  WAITING: 'bg-orange-500 text-white hover:bg-orange-600',
  BLOCKED: 'bg-red-500 text-white hover:bg-red-600',
  DONE: 'bg-green-500 text-white hover:bg-green-600',
  OFFLINE: 'bg-gray-500 text-white hover:bg-gray-600',
};

export function AgentCard({ id, agent }: AgentCardProps) {
  const { status, lastEvent, lastUpdated, characterId, subagentCount, isSubagent, description } = agent;

  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.OFFLINE;

  const timeAgo = useMemo(() => {
    if (!lastUpdated) return 'Unknown';
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }, [lastUpdated, status]); // recalculate when status changes

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-md border-border">
      {/* Background Pulse for Active States */}
      {(status === 'WORKING' || status === 'ORCHESTRATING' || status === 'THINKING' || status === 'READING') && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
      )}
      
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold truncate" title={id}>
              {id}
            </CardTitle>
            {isSubagent && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-muted">
                Sub
              </Badge>
            )}
            {subagentCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 text-[10px] px-1.5 py-0 h-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                <Zap className="w-3 h-3" />
                {subagentCount}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground truncate mt-1" title={description}>
              {description}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/50">
          <SpriteRenderer 
            characterId={characterId} 
            status={status} 
            className="w-32 h-32 transition-transform duration-300 group-hover:scale-105" 
          />
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <Badge className={`transition-colors duration-300 ${statusColor}`}>
            {status}
          </Badge>
          <div className="text-xs text-muted-foreground truncate text-right flex-1" title={lastEvent || 'No events yet'}>
            {lastEvent || 'No events yet'}
          </div>
        </div>
        
        <div className="text-[10px] text-muted-foreground/70 text-right">
          Updated: {timeAgo}
        </div>
      </CardContent>
    </Card>
  );
}
