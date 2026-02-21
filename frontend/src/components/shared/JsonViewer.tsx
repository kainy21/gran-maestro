import { cn } from '@/lib/utils';

export function JsonViewer({ data, className }: { data: any; className?: string }) {
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <pre className={cn("p-4 rounded-lg bg-muted overflow-x-auto font-mono text-xs", className)}>
      <code>{json}</code>
    </pre>
  );
}
