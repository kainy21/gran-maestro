import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Trash2, Upload, Paintbrush, Loader2 } from 'lucide-react';
import { apiFetch } from '../../hooks/useApi';
import { useAppContext } from '../../context/AppContext';
import type { ThemesResponse } from '../../hooks/useAgents';

interface ThemeManagerProps {
  themesData: ThemesResponse;
  onThemesChange: () => void;
}

export function ThemeManager({ themesData, onThemesChange }: ThemeManagerProps) {
  const { projectId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await apiFetch('/api/agents/themes/upload', projectId, {
        method: 'POST',
        body: formData as unknown as BodyInit,
      });
      onThemesChange();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleActivate = async (themeId: string) => {
    try {
      await apiFetch(`/api/agents/themes/${themeId}/activate`, projectId, {
        method: 'POST',
      });
      onThemesChange();
    } catch (err) {
      console.error('Failed to activate theme:', err);
    }
  };

  const handleDelete = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      await apiFetch(`/api/agents/themes/${themeId}`, projectId, {
        method: 'DELETE',
      });
      onThemesChange();
    } catch (err) {
      console.error('Failed to delete theme:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Paintbrush className="w-4 h-4" />
          Themes
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Themes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Available Themes</h4>
            {themesData.themes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No themes uploaded.</p>
            ) : (
              <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {themesData.themes.map((theme) => {
                  const isActive = theme.id === themesData.activeThemeId;
                  return (
                    <li key={theme.id} className="flex flex-col gap-2 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{theme.name}</span>
                          {isActive && <Badge variant="default" className="text-[10px] h-4">Active</Badge>}
                        </div>
                        <div className="flex items-center gap-1">
                          {!isActive && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleActivate(theme.id)} title="Activate">
                              <Paintbrush className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(theme.id)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {theme.files.length} file(s)
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Upload New Theme</h4>
            <div className="flex flex-col gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/gif"
                onChange={handleUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                Select .gif files to upload as a theme. They must match the naming convention.
              </p>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
