import { useAgents } from '../hooks/useAgents';
import { AgentGrid } from '../components/agents/AgentGrid';
import { EventTimeline } from '../components/agents/EventTimeline';
import { LivePulseChart } from '../components/agents/LivePulseChart';
import { ThemeManager } from '../components/agents/ThemeManager';
import { ScrollArea } from '../components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

export function AgentsView() {
  const { agents, events, themesData, loading, refetch } = useAgents();

  if (loading && Object.keys(agents).length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground">Monitor agent activities and state</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeManager themesData={themesData} onThemesChange={refetch} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Column: Agent Grid */}
        <div className="flex-[2] flex flex-col min-w-0 border rounded-lg bg-card/50">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="text-lg font-semibold">Active Agents</h3>
          </div>
          <ScrollArea className="flex-1">
            <AgentGrid agents={agents} />
          </ScrollArea>
        </div>

        {/* Right Column: Timeline & Chart */}
        <div className="flex-1 flex flex-col gap-6 min-w-[320px]">
          <div className="shrink-0">
            <LivePulseChart events={events} />
          </div>
          <div className="flex-1 min-h-0">
            <EventTimeline events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
