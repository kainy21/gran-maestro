import { useMemo, useEffect, useState } from 'react';
import type { AgentEvent } from '../../hooks/useAgents';

interface LivePulseChartProps {
  events: AgentEvent[];
}

export function LivePulseChart({ events }: LivePulseChartProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { bars, maxCount } = useMemo(() => {
    const BUCKET_COUNT = 60; // last 60 seconds
    const BUCKET_MS = 1000;
    
    const counts = new Array(BUCKET_COUNT).fill(0);
    const cutoff = now - (BUCKET_COUNT * BUCKET_MS);
    
    let max = 1; // avoid division by zero
    
    for (const event of events) {
      if (event.timestamp < cutoff) break; // Events are sorted newest first usually, assuming they are
      if (event.timestamp > now) continue;
      
      const diffMs = now - event.timestamp;
      const bucketIndex = BUCKET_COUNT - 1 - Math.floor(diffMs / BUCKET_MS);
      
      if (bucketIndex >= 0 && bucketIndex < BUCKET_COUNT) {
        counts[bucketIndex]++;
        if (counts[bucketIndex] > max) {
          max = counts[bucketIndex];
        }
      }
    }
    
    return { bars: counts, maxCount: max };
  }, [events, now]);

  return (
    <div className="flex flex-col h-48 border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Live Pulse (Last 60s)</h3>
        <span className="text-xs text-muted-foreground animate-pulse">● Live</span>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-1 overflow-hidden">
        {bars.map((count, i) => {
          const heightPercent = Math.max(5, (count / maxCount) * 100);
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-300 group relative"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: count > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                opacity: count > 0 ? 0.8 : 0.3
              }}
            >
              {count > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {count}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
        <span>60s ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}
