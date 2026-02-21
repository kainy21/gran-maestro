import { SSEStatus } from '@/hooks/useSse';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SseStatusDot({ status }: { status: SSEStatus }) {
  const statusColors = {
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
    connecting: 'bg-yellow-500 animate-pulse',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <span className={cn("h-3 w-3 rounded-full", statusColors[status])} />
            <span className="text-xs text-muted-foreground uppercase">{status}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>SSE Connection Status: {status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
