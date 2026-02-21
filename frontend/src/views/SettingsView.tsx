import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { apiFetch } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Save, RefreshCcw } from 'lucide-react';

export function SettingsView() {
  const { token } = useAppContext();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [token]);

  async function fetchConfig() {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/api/config', token);
      setConfig(data);
    } catch (err) {
      console.error('Failed to fetch config:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      // Simple notification via alert if needed or just visual feedback
      alert('Config saved successfully');
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>;
  }

  if (!config) return <div className="p-8 text-center">Failed to load config.</div>;

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-4xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-muted-foreground text-sm">System configuration and preferences.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchConfig} disabled={saving}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(config).map(([section, values]: [string, any]) => (
            <section key={section}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 px-1">{section}</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(values).map(([key, value]: [string, any]) => (
                  <Card key={key}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold font-mono">{key}</div>
                        <div className="text-xs text-muted-foreground">Description for {key} could go here.</div>
                      </div>
                      <div className="flex-1 max-w-md flex justify-end">
                        {typeof value === 'boolean' ? (
                          <Switch 
                            checked={value} 
                            onCheckedChange={(checked) => {
                              setConfig({
                                ...config,
                                [section]: { ...values, [key]: checked }
                              });
                            }} 
                          />
                        ) : typeof value === 'number' || typeof value === 'string' ? (
                          <Input 
                            value={value} 
                            type={typeof value === 'number' ? 'number' : 'text'}
                            className="text-right font-mono"
                            onChange={(e) => {
                              const val = typeof value === 'number' ? Number(e.target.value) : e.target.value;
                              setConfig({
                                ...config,
                                [section]: { ...values, [key]: val }
                              });
                            }}
                          />
                        ) : (
                          <pre className="text-[10px] bg-muted p-2 rounded truncate max-w-xs">{JSON.stringify(value)}</pre>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
