import { createContext, useContext, useCallback, ReactNode, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AnalyticsContextType {
  recordClick: (page: string, elementId?: string, elementType?: string) => void;
  startSession: () => Promise<number | null>;
  endSession: (sessionId: number) => Promise<void>;
  currentSessionId: number | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const recordClick = useCallback(async (page: string, elementId?: string, elementType?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return; // Only track authenticated users
      
      const response = await fetch('/api/analytics/clicks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          page,
          elementId,
          elementType
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to record click');
      }
    } catch (error) {
      console.error('Failed to record click:', error);
    }
  }, []);

  const startSession = useCallback(async (): Promise<number | null> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to start session');
      }
      
      const session = await response.json();
      setCurrentSessionId(session.id);
      
      // Store in sessionStorage for persistence across page refreshes
      sessionStorage.setItem('currentSessionId', session.id.toString());
      
      return session.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, []);

  const endSession = useCallback(async (sessionId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to end session');
      }
      
      setCurrentSessionId(null);
      sessionStorage.removeItem('currentSessionId');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, []);

  // Auto-start session on mount and handle cleanup
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return; // Only track authenticated users

    // Check if there's an existing session
    const existingSessionId = sessionStorage.getItem('currentSessionId');
    if (existingSessionId) {
      setCurrentSessionId(parseInt(existingSessionId));
    } else {
      startSession();
    }

    // Handle beforeunload to end session
    const handleBeforeUnload = () => {
      const sessionId = sessionStorage.getItem('currentSessionId');
      if (sessionId && token) {
        // Use sendBeacon for more reliable tracking when page is closing
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        headers.append('Content-Type', 'application/json');
        
        fetch('/api/sessions/' + sessionId + '/end', {
          method: 'POST',
          headers,
          body: JSON.stringify({}),
          keepalive: true
        }).catch(() => {
          // Fallback to sendBeacon if fetch fails
          navigator.sendBeacon('/api/sessions/' + sessionId + '/end');
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // End session on component unmount (if still active)
      if (currentSessionId) {
        endSession(currentSessionId);
      }
    };
  }, []);

  return (
    <AnalyticsContext.Provider value={{
      recordClick,
      startSession,
      endSession,
      currentSessionId
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    // Return a no-op implementation instead of throwing an error
    console.warn('useAnalytics called outside of AnalyticsProvider, using no-op implementation');
    return {
      recordClick: () => {},
      startSession: async () => null,
      endSession: async () => {},
      currentSessionId: null
    };
  }
  return context;
}

// Hook for tracking clicks on elements
export function useClickTracking(page: string) {
  const { recordClick } = useAnalytics();

  return useCallback((elementId?: string, elementType?: string) => {
    recordClick(page, elementId, elementType);
  }, [recordClick, page]);
}