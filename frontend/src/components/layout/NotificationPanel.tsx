import { useAppContext } from '@/context/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function NotificationPanel() {
  const { notifications, clearNotifications } = useAppContext();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center py-4">
        <span className="text-sm text-muted-foreground">{notifications.length} messages</span>
        <Button variant="ghost" size="sm" onClick={clearNotifications}>Clear all</Button>
      </div>
      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="flex flex-col gap-4 pb-10">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-xs uppercase tracking-wider text-primary">
                    {n.type || 'Event'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">
                  {typeof n.data === 'string' ? n.data : JSON.stringify(n.data)}
                </p>
                {n.projectId && (
                  <div className="mt-2 text-[10px] text-muted-foreground font-mono">
                    Project: {n.projectId}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
