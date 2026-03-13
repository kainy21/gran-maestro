import { AgentCard } from './AgentCard';
import type { AgentState } from '../../hooks/useAgents';

interface AgentGridProps {
  agents: Record<string, AgentState>;
}

export function AgentGrid({ agents }: AgentGridProps) {
  const agentEntries = Object.entries(agents);

  if (agentEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground border border-dashed rounded-lg">
        No agents found.
      </div>
    );
  }

  // Sort: Main agents first, then subagents, then by ID
  const sortedAgents = [...agentEntries].sort(([idA, a], [idB, b]) => {
    if (a.isSubagent && !b.isSubagent) return 1;
    if (!a.isSubagent && b.isSubagent) return -1;
    return idA.localeCompare(idB);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {sortedAgents.map(([id, agent]) => (
        <AgentCard key={id} id={id} agent={agent} />
      ))}
    </div>
  );
}
