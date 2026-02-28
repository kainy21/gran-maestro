import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { AlarmItem } from '../../context/AppContext';

export function CompletionAlarm() {
  const { alarms, dismissAlarm } = useAppContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {alarms.map((alarm) => (
        <AlarmToast key={alarm.key} alarm={alarm} onDismiss={dismissAlarm} />
      ))}
    </div>
  );
}

function AlarmToast({ alarm, onDismiss }: { alarm: AlarmItem; onDismiss: (key: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(alarm.key), 3000);
    return () => clearTimeout(timer);
  }, [alarm.key, onDismiss]);

  return (
    <div className="bg-card border rounded-lg px-3 py-2 text-sm font-medium shadow-md pointer-events-auto animate-in slide-in-from-right-full duration-200">
      {alarm.id} 종료
    </div>
  );
}
