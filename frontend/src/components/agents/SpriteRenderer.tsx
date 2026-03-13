import { useMemo } from 'react';
import type { AgentStatus } from '../../hooks/useAgents';

const STATUS_TO_GIF: Record<AgentStatus, string> = {
  WORKING: 'FORCE',
  ORCHESTRATING: 'FORCE',
  THINKING: 'THINK',
  READING: 'READING',
  WAITING: 'REST',
  BLOCKED: 'REST',
  DONE: 'FINISH',
  OFFLINE: 'OFFLINE',
};

const BUILTIN_CHARS: Record<string, string> = {
  frieren: 'FRIEREN',
  fern: 'FERN',
  stark: 'STARK',
  himmel: 'HIMMEL',
};

interface SpriteRendererProps {
  characterId: string;
  status: AgentStatus;
  className?: string;
}

export function SpriteRenderer({ characterId, status, className }: SpriteRendererProps) {
  const gifUrl = useMemo(() => {
    const safeCharacterId = characterId || 'frieren';
    const prefix = BUILTIN_CHARS[safeCharacterId] || BUILTIN_CHARS['frieren'];
    const statusGif = STATUS_TO_GIF[status] || 'REST';
    return `/uploads/sprites/${safeCharacterId}/${prefix}_${statusGif}.gif`;
  }, [characterId, status]);

  return (
    <div className={`relative flex items-center justify-center ${className || ''}`}>
      <img
        src={gifUrl}
        alt={`${characterId} - ${status}`}
        className="object-contain w-full h-full pixelated"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/uploads/sprites/frieren/FRIEREN_REST.gif';
        }}
      />
    </div>
  );
}
