import { useAppContext } from '@/context/AppContext';
import { SseStatusDot } from '@/components/shared/SseStatusDot';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Bell, Terminal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NotificationPanel } from './NotificationPanel';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { sseStatus, theme, setTheme, notifications } = useAppContext();
  const unreadCount = notifications.length; // Simplified, usually you'd track read state

  return (
    <header className="flex items-center justify-between px-6 py-3 border-bottom bg-background sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <Terminal className="h-6 w-6" />
          <span>Gran Maestro</span>
        </div>
        <div className="h-4 w-[1px] bg-border mx-2" />
        <SseStatusDot status={sseStatus} />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <NotificationPanel />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
