import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSse, SSEStatus } from '../hooks/useSse';

interface AppContextType {
  token: string;
  sseStatus: SSEStatus;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  // Initialize theme on mount
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const onSseEvent = useCallback((event: any) => {
    setNotifications(prev => [event, ...prev].slice(0, 50));
    // Trigger re-fetches or other logic based on event type if needed
  }, []);

  const { status: sseStatus } = useSse(token, onSseEvent);

  const addNotification = useCallback((n: any) => {
    setNotifications(prev => [n, ...prev].slice(0, 50));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <AppContext.Provider value={{
      token,
      sseStatus,
      notifications,
      addNotification,
      clearNotifications,
      theme,
      setTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
